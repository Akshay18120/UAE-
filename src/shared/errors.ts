export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details?: any) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export class ValidationError extends HttpError {
  constructor(message = 'Validation Error', details?: any) {
    super(422, message, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(500, message);
  }
}

export const errorHandler = (
  err: Error,
  _req: any,
  res: any,
  _next: any
) => {
  console.error(err);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Handle validation errors from class-validator
  if (Array.isArray((err as any).errors)) {
    const validationError = new ValidationError(
      'Validation failed',
      (err as any).errors.map((e: any) => ({
        property: e.property,
        constraints: e.constraints,
      }))
    );
    return res.status(validationError.statusCode).json({
      success: false,
      message: validationError.message,
      details: validationError.details,
    });
  }

  // Default to 500 for unhandled errors
  const internalError = new InternalServerError();
  res.status(internalError.statusCode).json({
    success: false,
    message: internalError.message,
  });
};
