export class CustomError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(400, message, details);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string, details?: any) {
    super(401, message, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, details?: any) {
    super(404, message, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string, details?: any) {
    super(403, message, details);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(409, message, details);
  }
}

export class ServerError extends CustomError {
  constructor(message: string, details?: any) {
    super(500, message, details);
  }
}
