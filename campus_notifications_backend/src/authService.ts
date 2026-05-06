import axios from 'axios';

const EVAL_BASE = 'http://20.207.122.201/evaluation-service';

let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Gets a valid Bearer token from the evaluation service.
 * Caches the token and only refreshes 60s before expiry.
 */
export async function getBearerToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && tokenExpiry > now + 60) {
    return cachedToken;
  }

  const res = await axios.post(
    `${EVAL_BASE}/auth`,
    {
      email: process.env.EMAIL,
      name: process.env.NAME,
      mobileNo: process.env.MOBILE_NO,
      githubUsername: process.env.GITHUB_USERNAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = res.data.expires_in;
  return cachedToken as string;
}
