import { IncomingMessage } from "http";

declare module "http" {
  interface IncomingMessage {
    body?: any;
    params?: Record<string, string>;
    user?: { userId: string; role: string };
  }
}
