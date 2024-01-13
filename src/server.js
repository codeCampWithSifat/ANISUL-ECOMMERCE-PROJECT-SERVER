import { app } from "./app.js";
import { serverPort } from "./secret.js";

app.listen(serverPort, () => {
  console.log(`Listening To The Port ${serverPort} Successfully`);
});
