// import { v4 as uuidv4 } from "uuid";
// import { IncomingMessage } from "http";

// interface LogMessage {
//   rid: string;
//   url: string;
//   req: {
//     headers: Record<string, string | string[] | undefined | number>;
//     params: Record<string, string>;
//     query: Record<string, string>;
//   };
//   res?: {
//     headers: Record<string, string | string[] | undefined | number>;
//     status: number;
//     data?: any;
//   };
// }

// export class LoggerService {
//   private context: string;

//   constructor(context: string) {
//     this.context = context;
//   }

//   private getTimestamp(): string {
//     return new Date().toISOString();
//   }

//   log(message: LogMessage, level: "log" | "error" | "warn" = "log") {
//     const logEntry = {
//       level,
//       date: this.getTimestamp(),
//       context: this.context,
//       message,
//     };
//     console.log(JSON.stringify(logEntry, null, 2));
//   }

//   createRequestLog(req: IncomingMessage): LogMessage {
//     const rid = uuidv4();
//     const url = `${req.method} ${req.url || ""}`;
//     const headers = req.headers;
//     const query = this.parseQuery(req.url);
//     const params = {}; // Add logic to parse params if your router supports it
//     const body = (req as any).body;

//     return {
//       rid,
//       url,
//       req: {
//         headers,
//         params,
//         query,
//         ...(body && Object.keys(body).length > 0 ? { body } : {}),
//       },
//     };
//   }

//   private parseQuery(url: string | undefined): Record<string, string> {
//     if (!url) return {};
//     const queryIndex = url.indexOf("?");
//     if (queryIndex === -1) return {};

//     const queryString = url.slice(queryIndex + 1);
//     const query: Record<string, string> = {};
//     new URLSearchParams(queryString).forEach((value, key) => {
//       query[key] = value;
//     });
//     return query;
//   }
// }


import { createLogger, format, transports } from "winston";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";
import { string } from "zod";

interface LogMessage {
  rid: string;
  url: string;
  req: {
    headers: Record<string, string | string[] | undefined | number>;
    params: Record<string, string>;
    query: Record<string, string>;
    body?: Record<string, any>;
  };
  res?: {
    headers: Record<string, string | string[] | undefined | number>;
    status: number;
    data?: any;
  };
}

export class LoggerService {
  private context: string;

  private logger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(({ level, message, timestamp, context }) => {
            return `${timestamp} [${level}]${
              context ? " [" + context + "]" : ""
            } ${
              typeof message === "string" ? message : JSON.stringify(message)
            }`;
          })
        ),
      }),
      new transports.File({ filename: "logs/error.log", level: "error" }),
      new transports.File({ filename: "logs/combined.log" }),
    ],
  });

  constructor(context: string) {
    this.context = context;
  }

  log(message: LogMessage , level: "info" | "error" | "warn" = "info") {
    this.logger.log({
      level,
      message: JSON.stringify(message, null, 2),
      context: this.context,
    });
  }

  createRequestLog(req: IncomingMessage): LogMessage {
    const rid = uuidv4();
    const url = `${req.method} ${req.url || ""}`;
    const headers = req.headers;
    const query = this.parseQuery(req.url);
    const params = {}; // manually attach if needed
    const body = (req as any).body;

    return {
      rid,
      url,
      req: {
        headers,
        params,
        query,
        ...(body && Object.keys(body).length > 0 ? { body } : {}),
      },
    };
  }

  private parseQuery(url: string | undefined): Record<string, string> {
    if (!url) return {};
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1) return {};

    const queryString = url.slice(queryIndex + 1);
    const query: Record<string, string> = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      query[key] = value;
    });
    return query;
  }
}
