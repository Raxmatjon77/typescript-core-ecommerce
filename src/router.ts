import { IncomingMessage, ServerResponse } from "http";
import { Middleware } from "./types";

interface RequestWithParams extends IncomingMessage {
  params?: Record<string, string>;
  body?: any;
  user?: { userId: string; role: string };
}

interface Route {
  method: string;
  path: string;
  regex: RegExp;
  paramNames: string[];
  middlewares: Middleware[];
  /**
   * Handler function for the route.
   * @param req - Incoming HTTP request with params, body, and user
   * @param res - Server response object
   * @returns A promise that resolves when the response is sent.
   */
  handler: (
    req: RequestWithParams,
    res: ServerResponse
  ) => void | Promise<void> | Promise<any>;
}

const routes: Route[] = [];
const globalMiddlewares: Middleware[] = [];

export function useMiddleware(middleware: Middleware) {
  globalMiddlewares.push(middleware);
}

export function addRoute(
  method: string,
  path: string,
  handler: (
    req: RequestWithParams,
    res: ServerResponse
  ) => void | Promise<void> | Promise<any>,
  middlewares: Middleware[] = []
) {
  // Convert path to regex and extract param names
  const paramNames: string[] = [];
  const regexPath = path.replace(/:([^\/]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "([^/]+)";
  });
  const regex = new RegExp(`^${regexPath}$`);
  routes.push({ method, path, regex, paramNames, middlewares, handler });
}

export async function handleRequest(
  req: RequestWithParams,
  res: ServerResponse
) {
  let middlewareIndex = 0;

  // Function to apply a chain of middlewares
  const applyMiddlewares = async (
    middlewares: Middleware[],
    next: () => Promise<void>
  ) => {
    if (middlewareIndex < middlewares.length) {
      const middleware = middlewares[middlewareIndex++];
      await middleware(req, res, () => applyMiddlewares(middlewares, next));
    } else {
      await next();
    }
  };

  // Process global middlewares first, then route-specific middlewares
  const route = routes.find((r) => {
    if (r.method !== req.method) return false;
    const match = req.url?.match(r.regex);
    if (match) {
      req.params = {};
      r.paramNames.forEach((name, index) => {
        req.params![name] = match[index + 1];
      });
      return true;
    }
    return false;
  });

  // Combine global and route-specific middlewares
  const allMiddlewares = route
    ? [...globalMiddlewares, ...route.middlewares]
    : globalMiddlewares;

  middlewareIndex = 0;
  await applyMiddlewares(allMiddlewares, async () => {
    if (route) {
      await route.handler(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "Route not found" } }));
    }
  });
}
