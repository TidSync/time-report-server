import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';

export const errorMiddleware = (
  error: HttpException,
  _req: Request,
  res: Response,
  //Variable has be instantiated so the middleware can take effect
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  res
    .status(error.statusCode)
    .json({ message: error.message, errorCode: error.errorCode, errors: error.errors });
};
