import "dotenv/config";

const serverPort = process.env.SERVER_PORT || 4000;
const mongodbURL = process.env.MONGODB_ATLAS_URL;

export { serverPort, mongodbURL };
