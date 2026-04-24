import type { Middleware } from "@http/types";
import type { LoggerService } from "@common/logger.service";

export function loggerMiddleware(logger: LoggerService): Middleware {
  return async (req, res, next) => {
    const start = Date.now();
    const log = logger.createRequestLog(req);

    res.on("finish", () => {
      logger.info({
        ...log,
        res: {
          status: res.statusCode,
          contentLength: res.getHeader("content-length"),
          durationMs: Date.now() - start,
        },
      });
    });

    await next();
  };
}
