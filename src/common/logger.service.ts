import { createLogger, format, transports, Logger } from "winston";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";

const REDACTED_HEADERS = new Set(["authorization", "cookie", "set-cookie"]);

interface LogMessage {
  rid: string;
  url: string;
  req: {
    headers: Record<string, string | string[] | undefined | number>;
    params: Record<string, string>;
    query: Record<string, string>;
  };
  res?: {
    status: number;
    contentLength?: string | number;
    durationMs?: number;
  };
}

export class LoggerService {
  private readonly logger: Logger;

  constructor(context: string, level = "info") {
    this.logger = createLogger({
      level,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { context },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp, context: ctx }) => {
              const msg =
                typeof message === "string" ? message : JSON.stringify(message);
              return `${timestamp} [${level}]${ctx ? ` [${ctx}]` : ""} ${msg}`;
            })
          ),
        }),
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log" }),
      ],
    });
  }

  log(message: unknown, level: "info" | "error" | "warn" = "info") {
    this.logger.log(level, message as string);
  }

  info(message: unknown) {
    this.logger.info(message as string);
  }

  error(message: unknown) {
    this.logger.error(message as string);
  }

  warn(message: unknown) {
    this.logger.warn(message as string);
  }

  createRequestLog(req: IncomingMessage): LogMessage {
    const rid = uuidv4();
    const url = `${req.method} ${req.url ?? ""}`;
    const headers: Record<string, string | string[] | undefined | number> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      headers[k] = REDACTED_HEADERS.has(k.toLowerCase()) ? "[REDACTED]" : v;
    }
    const query = parseQuery(req.url);
    return { rid, url, req: { headers, params: {}, query } };
  }
}

function parseQuery(url: string | undefined): Record<string, string> {
  if (!url) return {};
  const qi = url.indexOf("?");
  if (qi === -1) return {};
  const result: Record<string, string> = {};
  new URLSearchParams(url.slice(qi + 1)).forEach((v, k) => {
    result[k] = v;
  });
  return result;
}
