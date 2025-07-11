import { Middleware } from "../types/middleware";
import { CustomError } from "../utils/exception-filter";

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
    console.log(err);
    

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

    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: {
          message: "Internal server error",
          details: null,
        },
      })
    );
  }
};
