locals {
  proxy_lambda_md5 = md5(join("", concat(
    [filemd5("${path.module}/../lambda/proxy/index.ts")],
    [for f in fileset("${path.module}/../lambda/proxy/utils", "**/*.ts") : filemd5("${path.module}/../lambda/proxy/utils/${f}")],
  )))
  processor_lambda_md5 = filemd5("${path.module}/../lambda/processor/index.ts")
  lib_encryption_md5 = md5(join("", concat(
    [for f in fileset("${path.module}/../lib/encryption", "**/*.ts") : filemd5("${path.module}/../lib/encryption/${f}")]
  )))
  lib_api_helper_md5 = md5(join("", concat(
    [for f in fileset("${path.module}/../lib/api-helper", "**/*.ts") : filemd5("${path.module}/../lib/api-helper/${f}")]
  )))
}

resource "terraform_data" "bootstrap_lib_encryption" {
  triggers_replace = [
    local.lib_encryption_md5
  ]

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../lib/encryption && \
      npm run build && \
      mkdir -p ${path.module}/../../lib/lambda-layer/nodejs/node20/node_modules/encryption && \
      cp -r dist/. ${path.module}/../../lib/lambda-layer/nodejs/node20/node_modules/encryption/
    EOT
  }
}

resource "terraform_data" "bootstrap_lib_api_helper" {
  triggers_replace = [
    local.lib_api_helper_md5
  ]

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../lib/api-helper && \
      npm run build && \
      mkdir -p ${path.module}/../../lib/lambda-layer/nodejs/node20/node_modules/api-helper && \
      cp -r dist/. ${path.module}/../../lib/lambda-layer/nodejs/node20/node_modules/api-helper/
    EOT
  }
}


resource "terraform_data" "bootstrap_proxy_lambda" {
  triggers_replace = [
    local.proxy_lambda_md5
  ]

  provisioner "local-exec" {
    command     = "npm run build"
    working_dir = "${path.module}/../lambda/proxy"
  }
}

resource "terraform_data" "bootstrap_processor_lambda" {
  triggers_replace = [
    local.processor_lambda_md5
  ]

  provisioner "local-exec" {
    command     = "npm run build"
    working_dir = "${path.module}/../lambda/processor"
  }
}

data "archive_file" "proxy_lambda_handler" {
  type = "zip"

  source_dir  = "${path.module}/../lambda/proxy/dist"
  output_path = "${path.module}/../lambda/proxy/handler.zip"

  depends_on = [terraform_data.bootstrap_proxy_lambda]
}

data "archive_file" "processor_lambda_handler" {
  type = "zip"

  source_dir  = "${path.module}/../lambda/processor/dist"
  output_path = "${path.module}/../lambda/processor/handler.zip"

  depends_on = [terraform_data.bootstrap_processor_lambda]
}

data "archive_file" "lambda_layer" {
  type = "zip"

  source_dir  = "${path.module}/../lib/lambda-layer"
  output_path = "${path.module}/../lib/lambda-layer/nodejs/node20/nodejs.zip"

  depends_on = [terraform_data.bootstrap_lib_encryption, terraform_data.bootstrap_lib_api_helper]
}

resource "aws_s3_bucket" "proxy_lambda_bucket" {
  bucket = "proxy-lambda-bucket-${var.project_name}"
}

resource "aws_s3_bucket" "processor_lambda_bucket" {
  bucket = "processor-lambda-bucket-${var.project_name}"
}

resource "aws_s3_bucket_ownership_controls" "proxy_lambda_bucket" {
  bucket = aws_s3_bucket.proxy_lambda_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_ownership_controls" "processor_lambda_bucket" {
  bucket = aws_s3_bucket.processor_lambda_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "proxy_lambda_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.proxy_lambda_bucket]

  bucket = aws_s3_bucket.proxy_lambda_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_acl" "processor_lambda_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.processor_lambda_bucket]

  bucket = aws_s3_bucket.processor_lambda_bucket.id
  acl    = "private"
}

resource "aws_s3_object" "proxy_lambda_handler_zip" {
  bucket = aws_s3_bucket.proxy_lambda_bucket.id

  key    = "handler.zip"
  source = data.archive_file.proxy_lambda_handler.output_path

  depends_on  = [data.archive_file.proxy_lambda_handler]
  source_hash = data.archive_file.proxy_lambda_handler.output_base64sha256
}

resource "aws_s3_object" "processor_lambda_handler_zip" {
  bucket = aws_s3_bucket.processor_lambda_bucket.id

  key    = "handler.zip"
  source = data.archive_file.processor_lambda_handler.output_path

  depends_on  = [data.archive_file.processor_lambda_handler]
  source_hash = data.archive_file.processor_lambda_handler.output_base64sha256
}


resource "aws_lambda_layer_version" "lambda_deps_layer" {
  layer_name = "strava-lambda-dependency-layer"

  filename         = data.archive_file.lambda_layer.output_path
  source_code_hash = data.archive_file.lambda_layer.output_base64sha256

  compatible_runtimes = ["nodejs20.x"]
}
