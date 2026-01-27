import { DynamoDBDocument, NumberValue } from "@aws-sdk/lib-dynamodb";

import { APIGatewayProxyEvent } from "aws-lambda";
import { authorizeStravaOAuth } from "api-helper";
import { encrypt } from "encryption";

const SECRET_KEY_HEX = process.env.SECRE_KEY_HEX || "";
const TABLE_NAME = process.env.TABLE_NAME || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://ridescribe.click",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type OAuthAuthenticationParam = {
  dynamodbClient: DynamoDBDocument;
  event: APIGatewayProxyEvent;
};

export const handleOAuthAuthentication = async ({
  dynamodbClient,
  event,
}: OAuthAuthenticationParam) => {
  const code = event.queryStringParameters?.code || "";

  if (code) {
    console.log(`## EXCHANGING CODE ${code} FOR ACCESS TOKENS`);

    try {
      const data = await authorizeStravaOAuth(code);

      const accessToken = encrypt({
        text: data.access_token.toString(),
        key: Buffer.from(SECRET_KEY_HEX, "hex"),
      });

      const refreshToken = encrypt({
        text: data.refresh_token.toString(),
        key: Buffer.from(SECRET_KEY_HEX, "hex"),
      });

      const expiresAt = data.expires_at.toString();

      await dynamodbClient.put({
        TableName: TABLE_NAME,
        Item: {
          UserId: NumberValue.from(data.athlete.id),
          SK: "METADATA",
          AccessToken: accessToken,
          RefreshToken: refreshToken,
          ExpiresAt: expiresAt,
        },
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "OAuth authentication successful" }),
      };
    } catch (err) {
      console.error("## ERROR EXCHANGING CODE FOR TOKENS:", err);

      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  }

  return {
    statusCode: 400,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: "Missing authorization code" }),
  };
};
