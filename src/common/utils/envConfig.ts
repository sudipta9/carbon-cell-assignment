import dotenv from 'dotenv';
import { cleanEnv, host, num, port, str } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  HOST: host(),
  PORT: port(),
  CORS_ORIGIN: str(),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num(),
  COMMON_RATE_LIMIT_WINDOW_MS: num(),
  MONGO_URI: str(),
  JWT_ACCESS_TOKEN_SECRET: str(),
  JWT_REFRESH_TOKEN_SECRET: str(),
  JWT_ACCESS_TOKEN_EXPIRATION: str(),
  JWT_REFRESH_TOKEN_EXPIRATION: str(),
});
