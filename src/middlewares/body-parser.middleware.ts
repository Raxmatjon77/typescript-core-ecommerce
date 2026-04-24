import type { Middleware } from "@http/types";
import { BadRequestException } from "@common/exceptions";

const SKIP_METHODS = new Set(["GET", "HEAD", "OPTIONS", "DELETE"]);
const DEFAULT_MAX_BYTES = 1_048_576; // 1 MB

export function bodyParserMiddleware(maxBytes = DEFAULT_MAX_BYTES): Middleware {
  return async (req, res, next) => {
    if (SKIP_METHODS.has(req.method ?? "")) {
      (req as any).body = {};
      await next();
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let size = 0;

      req.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > maxBytes) {
          reject(new BadRequestException("Request body too large"));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });

      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        if (!raw) {
          (req as any).body = {};
          resolve();
          return;
        }
        try {
          (req as any).body = JSON.parse(raw);
          resolve();
        } catch {
          reject(new BadRequestException("Invalid JSON body"));
        }
      });

      req.on("error", reject);
    });

    await next();
  };
}
