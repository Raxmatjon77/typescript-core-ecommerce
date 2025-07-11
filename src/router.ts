import { IncomingMessage, ServerResponse } from "http";
import { Middleware } from "./types/middleware";

interface Route {
  method: string;
  path: string;
  handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
}

const routes: Route[] = [];
const middlewares: Middleware[] = [];

export function useMiddleware(middleware: Middleware) {
  middlewares.push(middleware);
}

export function addRoute(
  method: string,
  path: string,
  handler: (
    req: IncomingMessage,
    res: ServerResponse
  ) => void | Promise<void> | Promise<any>
) {
  routes.push({ method, path, handler });
}

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  let middlewareIndex = 0;

  const next = async () => {
    if (middlewareIndex < middlewares.length) {
      const middleware = middlewares[middlewareIndex++];
      await middleware(req, res, next);
    } else {
      const route = routes.find(
        (r) => r.method === req.method && r.path === req.url
      );
      if (route) {
        await route.handler(req, res);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Route not found" } }));
      }
    }
  };

  await next();
}
