import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || "";

type HandleWebhookEventParam = {
  sqsClient: SQSClient;
  event: APIGatewayProxyEvent;
};

const webhookEventSchema = z.object({
  object_type: z.string(),
  object_id: z.number(),
  aspect_type: z.string(),
  owner_id: z.number(),
  subscription_id: z.number(),
  event_time: z.number(),
});

export const handleWebhookEvent = async ({
  sqsClient,
  event,
}: HandleWebhookEventParam) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Bad request: missing body" }),
    };
  }

  try {
    const rawBody = JSON.parse(event.body);
    const body = webhookEventSchema.parse(rawBody);
    console.log("## WEBHOOK BODY:", JSON.stringify(body, null, 2));

    if (body.aspect_type !== "create" || body.object_type !== "activity") {
      // Ignore non-activity creation events
      return { statusCode: 200 };
    }

    console.log("## SENDING MESSAGE TO SQS QUEUE:", SQS_QUEUE_URL);
    const command = new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      DelaySeconds: 10,
      MessageBody: JSON.stringify(body),
    });

    const data = await sqsClient.send(command);
    console.log("## MESSAGE SUCCESSFULLY SENT. MESSAGE_ID:", data.MessageId);

    return { statusCode: 200 };
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process event" }),
    };
  }
};
