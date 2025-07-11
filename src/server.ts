import http from "http";
import dotenv from "dotenv";
import { Db } from "mongodb";
dotenv.config();

import { connectToMongo } from "./db/mongo";
import { Auth } from "./modules/auth/auth.service";
import { errorMiddleware } from "./middlewares/error-middleware";
import { addRoute, handleRequest, useMiddleware } from "./router";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { bodyParserMiddleware } from "./middlewares/body-parser.middleware";

async function bootstrap() {
  const db: Db = await connectToMongo();
  const authController = new Auth(db);

  useMiddleware(loggerMiddleware);
  useMiddleware(bodyParserMiddleware);

 
  addRoute("POST", "/auth/signin", authController.signin.bind(authController));

  addRoute("POST", "/auth/signup", authController.signup.bind(authController));
  useMiddleware(errorMiddleware);

  const server = http.createServer((req, res) => {
    if (req.url === "/ping") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "pong" }));
    }

    handleRequest(req, res);
  });

  server.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
  });
}

bootstrap().catch(console.error);
