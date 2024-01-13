import express from "express";

const app = express();
const port = 4000;

app.get("/test", (req, res) => {
  res.send(`Hello Anisul Server`);
});

app.listen(port, () => {
  console.log(`Listening To The Port ${port} successfully`);
});
