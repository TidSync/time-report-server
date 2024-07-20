import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: any) {
      let exception: HttpException;

      if (error instanceof HttpException) {
        exception = error;
      } else if (error instanceof ZodError) {
        exception = new HttpException(
          ErrorMessage.UNPROCESSABLE_ENTITY,
          ErrorCode.UNPROCESSABLE_ENTITY,
          StatusCode.UNPROCESSABLE_CONTENT,
          error?.issues,
        );
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
