import { app } from "./app.js";
import connectDB from "./config/db.js";
import { serverPort } from "./secret.js";

app.listen(serverPort, async () => {
  console.log(`Listening To The Port ${serverPort} Successfully`);
  await connectDB();
});
