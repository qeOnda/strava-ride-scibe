resource "aws_s3_bucket" "web" {
  bucket        = var.s3_bucket_name
  force_destroy = true
}

resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  aliases             = [var.domain]
  default_root_object = "index.html"
  is_ipv6_enabled     = true
  wait_for_deployment = true

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    target_origin_id       = aws_s3_bucket.web.bucket
    viewer_protocol_policy = "redirect-to-https"
  }

  origin {
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
    origin_id                = aws_s3_bucket.web.bucket

  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_cloudfront_origin_access_control" "web" {
  name                              = "s3-cloudfront-oac-${var.project_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_iam_policy_document" "cloudfront_oac_access" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = ["${aws_s3_bucket.web.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.web.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = data.aws_iam_policy_document.cloudfront_oac_access.json
}

resource "aws_route53_record" "main" {
  name    = var.domain
  type    = "A"
  zone_id = var.hosted_zone_id


  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
  }
}

resource "null_resource" "build_and_deploy" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/../web"
    command     = <<-EOT
      npm ci
      NEXT_PUBLIC_STRAVA_CLIENT_ID=${var.strava_client_id} \
      NEXT_PUBLIC_REDIRECT_URI=${var.base_url}/oauth-authentication \
      npm run build
    EOT
  }

  provisioner "local-exec" {
    command = "aws s3 sync ${path.module}/../web/out s3://${aws_s3_bucket.web.id} --delete"
  }

  depends_on = [aws_s3_bucket_policy.web]
}
