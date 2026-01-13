resource "aws_s3_bucket" "web" {
  bucket        = "web-${var.project_name}"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "web" {
  bucket = aws_s3_bucket.web.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "web" {
  bucket = aws_s3_bucket.web.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.web.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.web]
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
