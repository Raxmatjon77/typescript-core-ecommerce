import { Middleware } from "@types";
import { CustomError, InternalServerException } from "@utils";

export const errorMiddleware: Middleware = async (req, res, next) => {
  try {
    await next();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (res.headersSent) {
      console.warn(
        "Headers already sent, skipping response in errorMiddleware"
      );
      return;
    }

    if (err instanceof CustomError) {
      res.writeHead(err.statusCode, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            message: err.message,
            details: err.details || null,
          },
        })
      );
      return;
    }

    throw new InternalServerException("An unexpected error occurred");
  }
};
