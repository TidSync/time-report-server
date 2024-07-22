import { Prisma } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

const handleZodErrors = (error: ZodError) => {
  return new HttpException(
    ErrorMessage.UNPROCESSABLE_ENTITY,
    ErrorCode.UNPROCESSABLE_ENTITY,
    StatusCode.UNPROCESSABLE_CONTENT,
    error?.issues,
  );
};

const handlePrismaErrors = (error: Prisma.PrismaClientKnownRequestError) => {
  if (error.code === 'P2025') {
    return new HttpException(
      ErrorMessage.DATABASE_PROCESS_ERROR,
      ErrorCode.DATABASE_UPDATE,
      StatusCode.UNPROCESSABLE_CONTENT,
      error,
    );
  }

  return new HttpException(
    ErrorMessage.DATABASE_PROCESS_ERROR,
    ErrorCode.DATABASE_PROCESS,
    StatusCode.UNPROCESSABLE_CONTENT,
    error,
  );
};

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: any) {
      let exception: HttpException;

      if (error instanceof HttpException) {
        exception = error;
      } else if (error instanceof ZodError) {
        exception = handleZodErrors(error);
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        exception = handlePrismaErrors(error);
      } else {
        exception = new HttpException(
          ErrorMessage.SOMETHING_WENT_WRONG,
          ErrorCode.INTERNAL_EXCEPTION,
          StatusCode.INTERNAL_SERVER_ERROR,
          error,
        );
      }

      next(exception);
    }
  };
};
