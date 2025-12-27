const CLIENT_ID = process.env.STRAVA_CLIENT_ID || "";
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || "";
const STRAVA_OAUTH_ENDPOINT = process.env.STRAVA_OAUTH_ENDPOINT || "";

const oAuthPostStrava = async (body: URLSearchParams) =>
  fetch(STRAVA_OAUTH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

export const authorizeStravaOAuth = async (code: string) => {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
  });

  const res = await oAuthPostStrava(body);
  const resJson = await res.json();

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strava error ${res.status}: ${text}`);
  }

  return resJson;
};

export const refreshStravaOAuth = async (refreshToken: string) => {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await oAuthPostStrava(body);
  const resJson = await res.json();

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strava error ${res.status}: ${text}`);
  }

  return resJson;
};
