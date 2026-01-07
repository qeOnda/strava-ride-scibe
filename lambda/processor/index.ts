import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  DynamoDBDocument,
  GetCommand,
  NumberValue,
} from "@aws-sdk/lib-dynamodb";
import { decrypt, encrypt } from "encryption";

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { refreshStravaOAuth } from "api-helper";
import { SQSEvent } from "aws-lambda";

const SECRET_KEY_HEX = process.env.SECRE_KEY_HEX || "";
const TABLE_NAME = process.env.TABLE_NAME || "";
const AWS_REGION = process.env.AWS_REGION_VAR || "eu-central-1";
const BEDROCK_MODEL_ID = process.env.AWS_BEDROCK_MODEL_ID;
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;

const dynamodbClient = DynamoDBDocument.from(new DynamoDB({}));
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    console.log("## PROCESSING EVENT:", body);

    try {
      // Check if event has already been processed
      const response = await dynamodbClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { UserId: body.owner_id, SK: `ACTIVITY#${body.object_id}` },
        })
      );

      if (response.Item) {
        console.log(
          `## ACTIVITY ${body.object_id} EVENT ALREADY PROCESSED FOR USER ${body.owner_id}`
        );

        // Skip to the next record
        continue;
      }

      const tokenResponse = await dynamodbClient.get({
        TableName: TABLE_NAME,
        Key: { UserId: body.owner_id, SK: "METADATA" },
      });

      let newToken;
      const timestamp = Number(tokenResponse?.Item?.ExpiresAt);
      const expiry = new Date(timestamp * 1000);
      const tokenExpired = new Date() > expiry;

      if (tokenExpired) {
        const refreshToken = decrypt({
          encryptedText: tokenResponse?.Item?.RefreshToken,
          key: Buffer.from(SECRET_KEY_HEX, "hex"),
        });

        console.log("## ACCESS TOKEN EXPIRED FETCHING NEW TOKEN");
        const data = await refreshStravaOAuth(refreshToken);

        newToken = data.access_token.toString();

        const newAccessToken = encrypt({
          text: data.access_token.toString(),
          key: Buffer.from(SECRET_KEY_HEX, "hex"),
        });

        const newRefreshToken = encrypt({
          text: data.refresh_token.toString(),
          key: Buffer.from(SECRET_KEY_HEX, "hex"),
        });

        const expiresAt = data.expires_at.toString();

        await dynamodbClient.put({
          TableName: TABLE_NAME,
          Item: {
            UserId: NumberValue.from(data.athlete.id),
            SK: "METADATA",
            AccessToken: newAccessToken,
            RefreshToken: newRefreshToken,
            ExpiresAt: expiresAt,
          },
        });
      }

      const token = tokenExpired
        ? newToken
        : decrypt({
            encryptedText: tokenResponse?.Item?.AccessToken,
            key: Buffer.from(SECRET_KEY_HEX, "hex"),
          });

      console.log("## FETCHING ACTIVITY FROM STRAVA");
      const stravaResponse = await stravaRequest({
        activityId: body.object_id,
        method: "GET",
        token,
      });

      if (!stravaResponse.ok) {
        const text = await stravaResponse.text().catch(() => "");
        console.log(
          `Strava activity ${body.object_id} for user ${body.owner_id} fetch error ${stravaResponse.status}: ${text}`
        );

        // Skip to the next record
        continue;
      }

      const data = await stravaResponse.json();

      const prompt = {
        distance: data.distance,
        moving_time: data.moving_time,
        elapsed_time: data.elapsed_time,
        average_speed: data.average_speed,
        max_speed: data.max_speed,
        total_elevation_gain: data.total_elevation_gain,
        calories: data.calories,
        start_date_local: data.start_date_local,
        average_temp: data.average_temp,
        laps: data.laps,
        segment_efforts: data.segment_efforts,
      };

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        system: SYSTEM_PROMPT,
        max_tokens: 5000,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: JSON.stringify(prompt) }],
          },
        ],
      };

      const command = new InvokeModelCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId: BEDROCK_MODEL_ID,
        serviceTier: "default",
      });

      const apiResponse = await bedrockClient.send(command);

      const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
      const responseBody = JSON.parse(decodedResponseBody);
      const responseText = responseBody.content[0].text;

      console.log("## GENERATED DESCRIPTION:", responseText);

      console.log(
        `## STORING PROCESSED EVENT ACTIVITY#${body.object_id} IN DYNAMODB`
      );

      await dynamodbClient.put({
        TableName: TABLE_NAME,
        Item: {
          UserId: NumberValue.from(data.athlete.id),
          SK: `ACTIVITY#${body.object_id}`,
          SportType: data.sport_type,
          GeneratedDescription: responseText,
        },
      });

      console.log(
        `## UPDATING EVENT DESCRIPTION FOR ACTIVITY#${body.object_id} IN STRAVA`
      );

      await stravaRequest({
        activityId: body.object_id,
        body: JSON.stringify({
          description: responseText,
        }),
        method: "PUT",
        token,
      });
    } catch (error) {
      console.error("## ERROR PROCESSING EVENT:", error);

      // Skip to the next record
      continue;
    }
  }
};

const stravaRequest = async ({
  activityId,
  body,
  method,
  token,
}: {
  activityId: number;
  body?: string;
  method: "GET" | "PUT";
  token: string;
}) => {
  return fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });
};
