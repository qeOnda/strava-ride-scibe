resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.lambda.name}"

  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "strava_proxy_lambda_log_group" {
  name = "/aws/lambda/${aws_lambda_function.proxy_lambda_handler_function.function_name}"

  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "strava_processor_lambda_log_group" {
  name = "/aws/lambda/${aws_lambda_function.processor_lambda_handler_function.function_name}"

  retention_in_days = 30
}
