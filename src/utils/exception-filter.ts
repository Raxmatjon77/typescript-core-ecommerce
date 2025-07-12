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

export class BadRequestException extends CustomError {
  constructor(message: string, details?: any) {
    super(400, message, details);
  }
}

export class UnauthorizedException extends CustomError {
  constructor(message: string, details?: any) {
    super(401, message, details);
  }
}

export class NotFoundException extends CustomError {
  constructor(message: string, details?: any) {
    super(404, message, details);
  }
}

export class ForbiddenException extends CustomError {
  constructor(message: string, details?: any) {
    super(403, message, details);
  }
}

export class ConflictException extends CustomError {
  constructor(message: string, details?: any) {
    super(409, message, details);
  }
}

export class InternalServerException extends CustomError {
  constructor(message: string, details?: any) {
    super(500, message, details);
  }
}
