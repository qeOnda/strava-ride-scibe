import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { APIGatewayProxyEvent } from "aws-lambda";

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || "";

type handleWebhookEventParam = {
  sqsClient: SQSClient;
  event: APIGatewayProxyEvent;
};

export const handleWebhookEvent = async ({
  sqsClient,
  event,
}: handleWebhookEventParam) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Bad request: missing body" }),
    };
  }

  const body = JSON.parse(event.body);
  console.log("## WEBHOOK BODY:", JSON.stringify(body, null, 2));

  if (body) {
    // Process only activity creation events
    if (body.aspect_type === "create" && body.object_type === "activity") {
      try {
        console.log("## SENDING MESSAGE TO SQS QUEUE:", SQS_QUEUE_URL);

        const command = new SendMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          DelaySeconds: 10,
          MessageBody: JSON.stringify(body),
        });

        const data = await sqsClient.send(command);
        console.log(
          "## MESSAGE SUCCESSFULLY SENT. MESSAGE_ID:",
          data.MessageId
        );
      } catch (err) {
        console.error("## WEBHOOK EVENT ERROR:", err);

        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to process event" }),
        };
      }
    }

    // Webhook must return a 200 within 120 seconds
    return {
      statusCode: 200,
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Bad request" }),
  };
};
