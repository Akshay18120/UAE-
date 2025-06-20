import { Response } from 'express';

export enum ErrorType {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
}

export interface ErrorResponse {
  success: boolean;
  error: {
    type: ErrorType;
    message: string;
    code: number;
    details?: any;
    stack?: string;
    timestamp: string;
    path?: string;
    method?: string;
  };
}

export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract type: ErrorType;
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  abstract serializeErrors(): ErrorResponse;

  toResponse(res: Response): Response {
    return res.status(this.statusCode).json(this.serializeErrors());
  }
}

export class BadRequestError extends AppError {
  statusCode = 400;
  type = ErrorType.BAD_REQUEST;

  constructor(message = 'Bad Request', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  type = ErrorType.UNAUTHORIZED;

  constructor(message = 'Unauthorized', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message || 'Authentication required',
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  type = ErrorType.FORBIDDEN;

  constructor(message = 'Forbidden', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message || 'Insufficient permissions',
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
  type = ErrorType.NOT_FOUND;

  constructor(resource: string, details?: any) {
    super(`${resource} not found`, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  type = ErrorType.CONFLICT;

  constructor(message = 'Conflict', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ValidationError extends AppError {
  statusCode = 422;
  type = ErrorType.VALIDATION_ERROR;

  constructor(message = 'Validation failed', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class InternalServerError extends AppError {
  statusCode = 500;
  type = ErrorType.INTERNAL_SERVER_ERROR;

  constructor(message = 'Internal Server Error', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: process.env.NODE_ENV === 'development' ? this.details : undefined,
        stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ServiceUnavailableError extends AppError {
  statusCode = 503;
  type = ErrorType.SERVICE_UNAVAILABLE;

  constructor(message = 'Service Unavailable', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class RateLimitExceededError extends AppError {
  statusCode = 429;
  type = ErrorType.RATE_LIMIT_EXCEEDED;

  constructor(message = 'Too many requests, please try again later', details?: any) {
    super(message, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(message = 'Invalid or expired token', details?: any) {
    super(message, details);
    this.type = ErrorType.INVALID_TOKEN;
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor(message = 'Token has expired', details?: any) {
    super(message, details);
    this.type = ErrorType.TOKEN_EXPIRED;
  }
}

export class ExternalServiceError extends AppError {
  statusCode = 502;
  type = ErrorType.EXTERNAL_SERVICE_ERROR;

  constructor(service: string, details?: any) {
    super(`Error communicating with ${service}`, details);
  }

  serializeErrors(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Utility function to handle errors consistently
export function handleError(error: any, req: any, res: Response, next: any) {
  let errorToHandle = error;

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    errorToHandle = new InvalidTokenError('Invalid token');
  } else if (error.name === 'TokenExpiredError') {
    errorToHandle = new TokenExpiredError('Token has expired');
  }
  // Handle validation errors
  else if (error.name === 'ValidationError' || error.name === 'ValidatorError') {
    errorToHandle = new ValidationError('Validation failed', error.errors || error.message);
  }
  // Handle duplicate key errors
  else if (error.code === 11000 || error.code === 11001) {
    errorToHandle = new ConflictError('Duplicate entry', error.keyValue);
  }
  // Handle cast errors (e.g., invalid ObjectId)
  else if (error.name === 'CastError') {
    errorToHandle = new BadRequestError(`Invalid ${error.path}: ${error.value}`);
  }
  // Handle rate limit errors
  else if (error.status === 429) {
    errorToHandle = new RateLimitExceededError(error.message);
  }
  // If it's not one of our custom errors, wrap it as an internal server error
  else if (!(errorToHandle instanceof AppError)) {
    // In production, don't expose internal errors to the client
    const message = process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : errorToHandle.message;
      
    errorToHandle = new InternalServerError(message, {
      originalError: {
        name: errorToHandle.name,
        message: errorToHandle.message,
        stack: errorToHandle.stack,
      },
    });
  }

  // Add request info to the error
  if (req) {
    errorToHandle.errorInfo = {
      path: req.path,
      method: req.method,
      params: req.params,
      query: req.query,
      user: req.user,
    };
  }

  // Log the error
  const isServerError = errorToHandle.statusCode >= 500;
  
  if (isServerError) {
    console.error('Server Error:', errorToHandle);
    // Here you'd typically log to your error tracking service
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('Client Error:', errorToHandle);
  }

  // Send the error response
  const response = errorToHandle.serializeErrors();
  
  // Add any additional headers (e.g., for rate limiting)
  if (errorToHandle instanceof RateLimitExceededError && error.retryAfter) {
    res.set('Retry-After', String(Math.ceil(error.retryAfter / 1000)));
  }

  return res.status(errorToHandle.statusCode).json(response);
}
