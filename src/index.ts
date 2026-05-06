import axios from 'axios';

export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type Package = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler';

interface LogPayload {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

// Credentials set once at startup via setCredentials()
let config = {
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  email: process.env.EMAIL || '',
  name: process.env.NAME || '',
  mobileNo: process.env.MOBILE_NO || '',
  githubUsername: process.env.GITHUB_USERNAME || '',
  rollNo: process.env.ROLL_NO || '',
  accessCode: process.env.ACCESS_CODE || '',
};

let cachedToken: string | null = null;
let tokenExpiry = 0;

export const setCredentials = (
  clientId: string,
  clientSecret: string,
  email?: string,
  name?: string,
  mobileNo?: string,
  githubUsername?: string,
  rollNo?: string,
  accessCode?: string
) => {
  config.clientId = clientId;
  config.clientSecret = clientSecret;
  if (email) config.email = email;
  if (name) config.name = name;
  if (mobileNo) config.mobileNo = mobileNo;
  if (githubUsername) config.githubUsername = githubUsername;
  if (rollNo) config.rollNo = rollNo;
  if (accessCode) config.accessCode = accessCode;
  // Reset cached token whenever credentials change
  cachedToken = null;
  tokenExpiry = 0;
};

/**
 * Gets a valid Bearer token, fetching a fresh one if needed.
 */
async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiry > now + 60) {
    return cachedToken;
  }

  const res = await axios.post(
    'http://20.207.122.201/evaluation-service/auth',
    {
      email: config.email,
      name: config.name,
      mobileNo: config.mobileNo,
      githubUsername: config.githubUsername,
      rollNo: config.rollNo,
      accessCode: config.accessCode,
      clientID: config.clientId,
      clientSecret: config.clientSecret,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = res.data.expires_in;
  return cachedToken as string;
}

/**
 * Sends a structured log entry to the evaluation service.
 * Automatically handles token refresh.
 */
export async function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<void> {
  const url = 'http://20.207.122.201/evaluation-service/logs';

  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const token = await getToken();
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('Failed to send log:', error?.response?.data || error.message);
  }
}

export default Log;
