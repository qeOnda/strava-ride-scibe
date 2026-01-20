variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "ride-scribe"
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-central-1"
}

variable "strava_client_id" {
  description = "Strava OAuth client ID for frontend"
  type        = string
  sensitive   = true
}

variable "base_url" {
  description = "Backend API Gateway base URL"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for the web application"
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

variable "certificate_arn" {
  description = "ACM Certificate ARN for the custom domain"
  type        = string
  sensitive   = true
}
