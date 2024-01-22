import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import { rateLimit } from "express-rate-limit";
import seedRouter from "./routers/seedRouter.js";
import userRouter from "./routers/userRouter.js";
import { errrorResponse } from "./controllers/responseController.js";
import { authRouter } from "./routers/authRouter.js";
import { serverPort } from "./secret.js";
import connectDB from "./config/db.js";

const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 15,
  message: "Too Many Request ... Try Again Later",
});

// await connectDB();

// use all the middleware

app.use(morgan("dev"));
app.use(express.json());
app.use(limiter);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/test", (req, res) => {
  res.send(`Hello Anisul Server`);
});

// all the api
app.use("/api/seed", seedRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  next(createError(404, "Route Not Found"));
});

app.use((err, req, res, next) => {
  return errrorResponse(res, {
    statusCode: err.status,
    message: err.message,
  });
});

export { app };
