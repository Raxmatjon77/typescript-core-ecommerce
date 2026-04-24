import type { IncomingMessage, ServerResponse } from "http";
import type { Handler, Middleware } from "./types";

interface Route {
  method: string;
  rawPath: string; // stored for re-compilation when mounted under a prefix
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
  middlewares: Middleware[];
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

function compilePath(path: string): { pattern: RegExp; paramNames: string[] } {
  const normalized = path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const paramNames: string[] = [];
  const regexStr = normalized.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  return { pattern: new RegExp(`^${regexStr}$`), paramNames };
}

export class Router {
  readonly routes: Route[] = [];
  readonly globalMiddlewares: Middleware[] = [];

  use(middleware: Middleware) {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  get(path: string, handler: Handler, middlewares: Middleware[] = []) {
    return this.addRoute("GET", path, handler, middlewares);
  }

  post(path: string, handler: Handler, middlewares: Middleware[] = []) {
    return this.addRoute("POST", path, handler, middlewares);
  }

  put(path: string, handler: Handler, middlewares: Middleware[] = []) {
    return this.addRoute("PUT", path, handler, middlewares);
  }

  patch(path: string, handler: Handler, middlewares: Middleware[] = []) {
    return this.addRoute("PATCH", path, handler, middlewares);
  }

  delete(path: string, handler: Handler, middlewares: Middleware[] = []) {
    return this.addRoute("DELETE", path, handler, middlewares);
  }

  private addRoute(
    method: string,
    path: string,
    handler: Handler,
    middlewares: Middleware[]
  ) {
    const { pattern, paramNames } = compilePath(path);
    this.routes.push({ method, rawPath: path, pattern, paramNames, handler, middlewares });
    return this;
  }

  mount(prefix: string, subRouter: Router) {
    const normalizedPrefix = prefix.replace(/\/$/, "");
    for (const route of subRouter.routes) {
      const fullPath = normalizedPrefix + route.rawPath;
      const { pattern, paramNames } = compilePath(fullPath);
      this.routes.push({ ...route, rawPath: fullPath, pattern, paramNames });
    }
    return this;
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const rawUrl = req.url ?? "/";
    const parsed = new URL(rawUrl, "http://x");
    const pathname = parsed.pathname.replace(/\/$/, "") || "/";
    const method = req.method ?? "GET";

    (req as any).query = Object.fromEntries(parsed.searchParams.entries());

    let pathMatchedMethods: string[] = [];
    let matched: Route | null = null;

    const effectiveMethod = method === "HEAD" ? "GET" : method;

    for (const route of this.routes) {
      const m = pathname.match(route.pattern);
      if (!m) continue;
      pathMatchedMethods.push(route.method);
      if (route.method !== effectiveMethod) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      (req as any).params = params;
      matched = route;
      break;
    }

    if (!matched) {
      if (method === "OPTIONS" && pathMatchedMethods.length > 0) {
        res.writeHead(204, {
          Allow: [...new Set([...pathMatchedMethods, "OPTIONS"])].join(", "),
        });
        res.end();
        return;
      }
      if (pathMatchedMethods.length > 0) {
        sendJson(res, 405, {
          error: {
            message: `Method ${method} not allowed`,
            details: { allowed: pathMatchedMethods },
          },
        });
      } else {
        sendJson(res, 404, { error: { message: "Not found" } });
      }
      return;
    }

    const allMiddlewares = [...this.globalMiddlewares, ...matched.middlewares];
    await this.runChain(allMiddlewares, matched.handler, req, res);

    if (method === "HEAD" && !res.writableEnded) {
      res.end();
    }
  }

  private async runChain(
    middlewares: Middleware[],
    handler: Handler,
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    // Koa-style dispatch: each level gets its own next() bound to i+1.
    // The `called` guard prevents the same level from advancing twice.
    let called = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= called) return;
      called = i;
      if (i >= middlewares.length) {
        await handler(req, res);
        return;
      }
      await middlewares[i](req, res, () => dispatch(i + 1));
    };

    await dispatch(0);
  }
}
