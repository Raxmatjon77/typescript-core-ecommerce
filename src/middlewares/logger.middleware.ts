import { Middleware } from "../types/middleware";
import { LoggerService } from "../utils/logger.service";
import { IncomingMessage, ServerResponse } from "http";

interface RequestWithBody extends IncomingMessage {
  body?: any;
}

interface ResponseWithCustomData extends ServerResponse {
  _body?: any;
}

export const loggerMiddleware: Middleware = async (
  req: RequestWithBody,
  res: ResponseWithCustomData,
  next
) => {
  const logger = new LoggerService("LoggerService");
  const start = Date.now();

  const logMessage = logger.createRequestLog(req);
  logger.log(logMessage);

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let responseBody: any = null;

  res.write = function (chunk: any, ...args: any[]) {
    if (typeof chunk === "string" || Buffer.isBuffer(chunk)) {
      try {
        responseBody = JSON.parse(chunk.toString());
      } catch {
        responseBody = chunk.toString();
      }
    }
    return originalWrite(chunk, ...args);
  };

  res.end = function (data?: any, ...args: any[]) {
    if (data && (typeof data === "string" || Buffer.isBuffer(data))) {
      try {
        responseBody = JSON.parse(data.toString());
      } catch {
        responseBody = data.toString();
      }
    }

    const duration = Date.now() - start;
    const responseHeaders = res.getHeaders();

    logger.log({
      ...logMessage,
      res: {
        headers: responseHeaders,
        status: res.statusCode,
        data: responseBody,
      },
    });

    return originalEnd(data, ...args);
  };

  await next();
};
