import "dotenv/config";

const serverPort = process.env.SERVER_PORT || 4000;
const mongodbURL = process.env.MONGODB_ATLAS_URL;
const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || "coding-rider";
const smtpUserName = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const clientURL = process.env.CLIENT_URL || "http://localhost:3000";

export {
  serverPort,
  mongodbURL,
  jwtActivationKey,
  smtpUserName,
  smtpPassword,
  clientURL,
};
