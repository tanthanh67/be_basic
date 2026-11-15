import dotenv from "dotenv";
dotenv.config();

const cookieSecure = process.env.COOKIE_SECURE;
if (cookieSecure !== undefined && !["true", "false"].includes(cookieSecure)) {
  throw new Error("COOKIE_SECURE must be true or false");
}

export const config = {
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "default_secret_key",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  cookie: {
    secure: cookieSecure === undefined
      ? process.env.NODE_ENV === "production"
      : cookieSecure === "true",
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
};
