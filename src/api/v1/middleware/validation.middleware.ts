import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { BadRequestError } from '../../shared/errors';

export function validateRequest<T extends object>(type: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(type, req.body);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false },
      });

      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => 
            Object.values(error.constraints || {}).join(', ')
          )
          .join('; ');
        throw new BadRequestError(`Validation failed: ${message}`);
      }

      // Replace body with the validated and transformed object
      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T extends object>(type: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(type, req.query);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false },
      });

      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => 
            Object.values(error.constraints || {}).join(', ')
          )
          .join('; ');
        throw new BadRequestError(`Query validation failed: ${message}`);
      }

      // Replace query with the validated and transformed object
      req.query = dto as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T extends object>(type: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(type, req.params);
      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false },
      });

      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => 
            Object.values(error.constraints || {}).join(', ')
          )
          .join('; ');
        throw new BadRequestError(`Parameters validation failed: ${message}`);
      }

      // Replace params with the validated and transformed object
      req.params = dto as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
