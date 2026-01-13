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
