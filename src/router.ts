import { IncomingMessage, ServerResponse } from "http";
import { Middleware } from "./types/middleware";

interface Route {
  method: string;
  path: string;
  regex: RegExp;
  paramNames: string[];
  /**
   * Handler function for the route.
   * @param req - Incoming HTTP request
   * @param res - Server response object
   * @returns A promise that resolves when the response is sent.
   */
  handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
}

const routes: Route[] = [];
const middlewares: Middleware[] = [];

export function useMiddleware(middleware: Middleware) {
  middlewares.push(middleware);
}

interface RequestWithParams extends IncomingMessage {
  params?: Record<string, string>;
}

export function addRoute(
  method: string,
  path: string,
  handler: (
    req: RequestWithParams,
    res: ServerResponse
  ) => void | Promise<void> | Promise<any>
) {
  // Convert path to regex and extract param names
  const paramNames: string[] = [];
  const regexPath = path.replace(/:([^\/]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "([^/]+)";
  });
  const regex = new RegExp(`^${regexPath}$`);
  routes.push({ method, path, regex, paramNames, handler });
}

export async function handleRequest(
  req: RequestWithParams,
  res: ServerResponse
) {
  let middlewareIndex = 0;

  const next = async () => {
    if (middlewareIndex < middlewares.length) {
      const middleware = middlewares[middlewareIndex++];
      await middleware(req, res, next);
    } else {
      const route = routes.find((r) => {
        if (r.method !== req.method) return false;
        const match = req.url?.match(r.regex);
        if (match) {
          // Extract params and attach to req
          req.params = {};
          r.paramNames.forEach((name, index) => {
            req.params![name] = match[index + 1];
          });
          return true;
        }
        return false;
      });

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
