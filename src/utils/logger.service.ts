import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";

interface LogMessage {
  rid: string;
  url: string;
  req: {
    headers: Record<string, string | string[] | undefined | number>;
    params: Record<string, string>;
    query: Record<string, string>;
  };
  res?: {
    headers: Record<string, string | string[] | undefined | number>;
    status: number;
    data?: any;
  };
}

export class LoggerService {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  log(message: LogMessage, level: "log" | "error" | "warn" = "log") {
    const logEntry = {
      level,
      date: this.getTimestamp(),
      context: this.context,
      message,
    };
    console.log(JSON.stringify(logEntry, null, 2));
  }

  createRequestLog(req: IncomingMessage): LogMessage {
    const rid = uuidv4();
    const url = `${req.method} ${req.url || ""}`;
    const headers = req.headers;
    const query = this.parseQuery(req.url);
    const params = {}; // Add logic to parse params if your router supports it
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
