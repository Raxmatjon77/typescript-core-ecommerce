import { Middleware } from "@types";
import { CustomError, InternalServerException } from "@utils";
import { log } from "node:console";

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

    log("Unexpected error in errorMiddleware:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: {
          message: "Internal Server Error",
          details: error.message,
        },
      })
    );
    // Optionally, you can log the error to a logging service here
    // e.g., logService.logError(error);
    throw new InternalServerException("An unexpected error occurred");
  }
};
