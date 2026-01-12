resource "aws_lambda_function" "proxy_lambda_handler_function" {
  function_name = "proxy-lambda-handler-${var.project_name}"

  s3_bucket = aws_s3_bucket.proxy_lambda_bucket.id
  s3_key    = aws_s3_object.proxy_lambda_handler_zip.key

  runtime = "nodejs20.x"
  handler = "index.handler"

  source_code_hash = data.archive_file.proxy_lambda_handler.output_base64sha256
  memory_size      = 200
  role             = aws_iam_role.lambda_exec_proxy_handler.arn

  layers = [
    aws_lambda_layer_version.lambda_deps_layer.arn
  ]

  environment {
    variables = {
      SQS_QUEUE_URL         = aws_sqs_queue.base_queue.url
      STRAVA_CLIENT_ID      = var.strava_client_id
      STRAVA_CLIENT_SECRET  = var.strava_client_secret
      SECRE_KEY_HEX         = var.secret_key_hex
      STRAVA_OAUTH_ENDPOINT = var.strava_oauth_endpoint
      TABLE_NAME            = aws_dynamodb_table.strava_descriptions_table.name
      AWS_REGION_VAR        = var.aws_region
    }
  }
}

resource "aws_lambda_function" "processor_lambda_handler_function" {
  function_name = "processor-lambda-handler-${var.project_name}"

  s3_bucket = aws_s3_bucket.processor_lambda_bucket.id
  s3_key    = aws_s3_object.processor_lambda_handler_zip.key

  runtime = "nodejs20.x"
  handler = "index.handler"

  source_code_hash = data.archive_file.processor_lambda_handler.output_base64sha256
  memory_size      = 200
  timeout          = var.lambda_timeout_seconds
  role             = aws_iam_role.lambda_exec_processor_handler.arn

  layers = [
    aws_lambda_layer_version.lambda_deps_layer.arn
  ]

  environment {
    variables = {
      SQS_QUEUE_URL         = aws_sqs_queue.base_queue.url
      STRAVA_CLIENT_ID      = var.strava_client_id
      STRAVA_CLIENT_SECRET  = var.strava_client_secret
      SECRE_KEY_HEX         = var.secret_key_hex
      STRAVA_OAUTH_ENDPOINT = var.strava_oauth_endpoint
      TABLE_NAME            = aws_dynamodb_table.strava_descriptions_table.name
      AWS_REGION_VAR        = var.aws_region
      AWS_BEDROCK_MODEL_ID  = var.aws_bedrock_model_id
      SYSTEM_PROMPT         = var.system_prompt
    }
  }
}

resource "aws_iam_role" "lambda_exec_proxy_handler" {
  name = "proxy-lambda-exec-role-${var.project_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role" "lambda_exec_processor_handler" {
  name = "processor-lambda-exec-role-${var.project_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "proxy_lambda_policy" {
  role       = aws_iam_role.lambda_exec_proxy_handler.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "processor_lambda_policy" {
  role       = aws_iam_role.lambda_exec_processor_handler.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_apigatewayv2_api" "lambda" {
  name          = "api-gateway-${var.project_name}"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "proxy_lambda_handler_function" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.proxy_lambda_handler_function.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "webhook" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "ANY /webhook"
  target    = "integrations/${aws_apigatewayv2_integration.proxy_lambda_handler_function.id}"
}

resource "aws_apigatewayv2_route" "oauth_authentication" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "POST /oauth-authentication"
  target    = "integrations/${aws_apigatewayv2_integration.proxy_lambda_handler_function.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.proxy_lambda_handler_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_sqs_queue" "base_queue" {
  name                       = "queue-${var.project_name}"
  message_retention_seconds  = 86400
  visibility_timeout_seconds = var.lambda_timeout_seconds
}

resource "aws_sqs_queue" "deadletter_queue" {
  name                       = "queue-${var.project_name}-dlq"
  message_retention_seconds  = 86400
  visibility_timeout_seconds = var.lambda_timeout_seconds
}

resource "aws_sqs_queue_redrive_policy" "terraform_queue_redrive_policy" {
  queue_url = aws_sqs_queue.base_queue.id

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_queue.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue_redrive_allow_policy" "terraform_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.deadletter_queue.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.base_queue.arn]
  })
}


resource "aws_iam_policy" "producer_policy" {
  name        = "sqs-${var.project_name}-${var.aws_region}-producer"
  description = "Attach this policy to producers for ${var.project_name} SQS queue"
  policy      = data.aws_iam_policy_document.producer_policy.json
}

data "aws_iam_policy_document" "producer_policy" {
  statement {
    actions = [
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:SendMessage",
      "sqs:SendMessageBatch"
    ]
    resources = [
      aws_sqs_queue.base_queue.arn
    ]
  }
}

resource "aws_iam_role_policy_attachment" "application_role_notifications_producer" {
  role       = aws_iam_role.lambda_exec_proxy_handler.name
  policy_arn = aws_iam_policy.producer_policy.arn
}

resource "aws_iam_policy" "consumer_policy" {
  name        = "sqs-${var.project_name}-${var.aws_region}-consumer"
  description = "Attach this policy to consumers for ${var.project_name} SQS queue"
  policy      = data.aws_iam_policy_document.consumer_policy.json
}

data "aws_iam_policy_document" "consumer_policy" {
  statement {
    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage",
    ]
    resources = [
      aws_sqs_queue.base_queue.arn
    ]
  }
}

resource "aws_iam_role_policy_attachment" "application_role_notifications_consumer" {
  role       = aws_iam_role.lambda_exec_processor_handler.name
  policy_arn = aws_iam_policy.consumer_policy.arn
}

resource "aws_lambda_event_source_mapping" "example" {
  event_source_arn = aws_sqs_queue.base_queue.arn
  function_name    = aws_lambda_function.processor_lambda_handler_function.arn
  batch_size       = 2

  scaling_config {
    maximum_concurrency = 10
  }
}

resource "aws_dynamodb_table" "strava_descriptions_table" {
  name         = "StavaDescriptions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"
  range_key    = "SK"

  attribute {
    name = "UserId"
    type = "N"
  }

  attribute {
    name = "SK"
    type = "S"
  }
}

data "aws_iam_policy_document" "proxy_lambda_dynamodb" {
  statement {
    actions = [
      "dynamodb:PutItem"
    ]

    resources = [
      aws_dynamodb_table.strava_descriptions_table.arn,
      "${aws_dynamodb_table.strava_descriptions_table.arn}/index/*"
    ]
  }
}

data "aws_iam_policy_document" "processor_lambda_dynamodb" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
    ]

    resources = [
      aws_dynamodb_table.strava_descriptions_table.arn,
      "${aws_dynamodb_table.strava_descriptions_table.arn}/index/*"
    ]
  }
}

resource "aws_iam_policy" "proxy_lambda_dynamodb_access" {
  name   = "proxy-lambda-dynamodb-access-${var.project_name}"
  policy = data.aws_iam_policy_document.proxy_lambda_dynamodb.json
}

resource "aws_iam_policy" "processor_lambda_dynamodb_access" {
  name   = "processor-lambda-dynamodb-access-${var.project_name}"
  policy = data.aws_iam_policy_document.processor_lambda_dynamodb.json
}

resource "aws_iam_role_policy_attachment" "proxy_lambda_dynamodb_attach" {
  role       = aws_iam_role.lambda_exec_proxy_handler.name
  policy_arn = aws_iam_policy.proxy_lambda_dynamodb_access.arn
}

resource "aws_iam_role_policy_attachment" "processor_lambda_dynamodb_attach" {
  role       = aws_iam_role.lambda_exec_processor_handler.name
  policy_arn = aws_iam_policy.processor_lambda_dynamodb_access.arn
}

resource "aws_iam_role_policy_attachment" "lambda_bedrock_attach" {
  role       = aws_iam_role.lambda_exec_processor_handler.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "bedrock_access" {
  name = "bedrock-invoke"
  role = aws_iam_role.lambda_exec_processor_handler.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["bedrock:InvokeModel"],
      Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/${var.aws_bedrock_model_id}"
    }]
  })
}
