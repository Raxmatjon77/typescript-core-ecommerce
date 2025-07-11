import { IncomingMessage, ServerResponse } from "http";

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void | Promise<void>
) => void | Promise<void> | unknown | any | Promise<unknown> | Promise<any>;
