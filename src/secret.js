import "dotenv/config";

const serverPort = process.env.SERVER_PORT || 4000;
const mongodbURL = process.env.MONGODB_ATLAS_URL;
const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || "coding-rider";
const smtpUserName = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
const jwtAccessKey = process.env.JWT_ACCESS_KEY || "coding-rider";
const jwtResetPasswordKey =
  process.env.JWT_RESET_PASSWORD_KEY || "coding-rider-reset";

const jwtRefreshKey = process.env.JWT_REFRESH_KEY || "coding-rider-refresh-key";

export {
  serverPort,
  mongodbURL,
  jwtActivationKey,
  smtpUserName,
  smtpPassword,
  clientURL,
  jwtAccessKey,
  jwtResetPasswordKey,
  jwtRefreshKey,
};
