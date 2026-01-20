output "base_url" {
  description = "Base URL for API Gateway stage."

  value = aws_api_gateway_stage.lambda.invoke_url
}

output "base_queue_url" {
  value = aws_sqs_queue.base_queue.id
}

output "deadletter_queue_url" {
  value = aws_sqs_queue.deadletter_queue.id
}

output "producer_policy_arn" {
  value = aws_iam_policy.producer_policy.arn
}
