resource "aws_api_gateway_domain_name" "api_domain" {
  certificate_arn = var.certificate_arn
  domain_name     = var.domain
}

resource "aws_api_gateway_base_path_mapping" "api_mapping" {
  api_id      = aws_api_gateway_rest_api.lambda.id
  stage_name  = aws_api_gateway_stage.lambda.stage_name
  domain_name = aws_api_gateway_domain_name.api_domain.domain_name
}

resource "aws_route53_record" "example" {
  name    = aws_api_gateway_domain_name.api_domain.domain_name
  type    = "A"
  zone_id = var.hosted_zone_id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.api_domain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api_domain.cloudfront_zone_id
  }
}
