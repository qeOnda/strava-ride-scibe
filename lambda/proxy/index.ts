import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { handleOAuthAuthentication } from "./utils/handleOAuthAuthentication";
import { handleWebhookEvent } from "./utils/handleWebhookEvent";
import { handleWebhookSubscription } from "./utils/handleWebhookSubscription";

const sqsClient = new SQSClient({});
const dynamodbClient = DynamoDBDocument.from(new DynamoDB({}));

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log("## EVENT RECEIVED: ", JSON.stringify(event));

  // Handle webhook POST requests
  if (event.resource === "/webhook" && event.httpMethod === "POST") {
    return await handleWebhookEvent({
      sqsClient,
      event,
    });
  }

  // Handle webhook subscription verification
  if (event.resource === "/webhook" && event.httpMethod === "GET") {
    return handleWebhookSubscription(event);
  }

  // Handle OAuth authentication
  if (
    event.resource === "/oauth-authentication" &&
    event.httpMethod === "POST"
  ) {
    return await handleOAuthAuthentication({ dynamodbClient, event });
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Bad request" }),
  };
};
