import type { IncomingMessage, ServerResponse } from "http";

export type Handler = (
  req: IncomingMessage,
  res: ServerResponse
) => void | Promise<void>;

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => Promise<void>
) => void | Promise<void>;
