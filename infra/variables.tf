variable "project_name" {
  description = "Project name."

  type    = string
  default = "ride-scribe"
}

variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "eu-central-1"
}

variable "strava_client_id" {
  description = "Strava API Client ID."

  type = string
}

variable "strava_client_secret" {
  description = "Strava API Client Secret."

  type = string
}

variable "secret_key_hex" {
  description = "Hex encoded secret key for encryption."

  type = string
}

variable "strava_oauth_endpoint" {
  description = "Strava OAuth token endpoint."

  type = string
}

variable "lambda_timeout_seconds" {
  description = "Lambda timeout in seconds."

  type    = number
  default = 100
}

variable "aws_bedrock_model_id" {
  description = "AWS Bedrock model ID"

  type = string
}

variable "system_prompt" {
  description = "System prompt for the AI model."

  type = string
}

variable "certificate_arn" {
  description = "ACM Certificate ARN for the custom domain"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Custom domain name for the web application"
  type        = string
  sensitive   = true
}

variable "hosted_zone_id" {
  description = "Route 53 Hosted Zone ID for the custom domain"
  type        = string
  sensitive   = true
}

variable "strava_verify_token" {
  description = "Strava webhook verification token"
  type        = string
  sensitive   = true
}
