import { APIGatewayProxyEvent } from "aws-lambda";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

export const handleWebhookSubscription = (event: APIGatewayProxyEvent) => {
  const params = event.queryStringParameters ?? {};
  const mode = params["hub.mode"] ?? "";
  const token = params["hub.verify_token"] ?? "";
  const challenge = params["hub.challenge"] ?? "";

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      const body = {
        "hub.challenge": challenge,
      };

      const response = {
        statusCode: 200,
        body: JSON.stringify(body),
      };

      return response;
    }

    return {
      statusCode: 403,
    };
  }

  return;
};
