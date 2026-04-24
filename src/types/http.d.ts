declare module "http" {
  interface IncomingMessage {
    body?: unknown;
    params?: Record<string, string>;
    query?: Record<string, string>;
    user?: { userId: string; role: string };
  }
}
