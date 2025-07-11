import { Middleware } from "../types/middleware";

export const bodyParserMiddleware: Middleware = (req, res, next) => {
  const contentType = req.headers["content-type"];
  if (
    req.method === "GET" ||
    req.method === "DELETE" ||
    contentType !== "application/json"
  ) {
    return next();
  }

  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    try {
      if (data) {
        req.body = JSON.parse(data);
      } else {
        req.body = {};
      }
      next();
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });

  req.on("error", (err) => {
    console.error("Body parse error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Body parse error" }));
  });
};
