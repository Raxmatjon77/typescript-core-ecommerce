import http from "http";
import dotenv from "dotenv";

dotenv.config();
import { Db } from "mongodb";
import { addRoute, handleRequest, useMiddleware } from "./router";
import {
  authMiddleware,
  errorMiddleware,
  loggerMiddleware,
  bodyParserMiddleware,
} from "@middlewares";

import { Auth } from "@modules";
import { connectToMongo } from "@db";
async function bootstrap() {
  const db: Db = await connectToMongo();
  const authController = new Auth(db);
  useMiddleware(bodyParserMiddleware);
  useMiddleware(loggerMiddleware);

  addRoute("POST", "/auth/signin", authController.signin.bind(authController));
  addRoute("POST", "/auth/signup", authController.signup.bind(authController));
  addRoute(
    "GET",
    "/auth/user/",
    authController.getUserById.bind(authController),
    [authMiddleware]
  );
  useMiddleware(errorMiddleware);

  const server = http.createServer((req, res) => {
    if (req.url === "/ping") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "pong" }));
    }

    handleRequest(req, res);
  });

  server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
  });
}

bootstrap().catch(console.error);
