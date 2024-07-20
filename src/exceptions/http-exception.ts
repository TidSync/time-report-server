// message, status code, error codes, error

import { ErrorCode } from 'constants/api-rest-codes';

export class HttpException extends Error {
  public message: string;
  public errorCode: ErrorCode;
  public statusCode: number;
  public errors: any;

  constructor(message: string, errorCode: ErrorCode, statusCode: number, error: any) {
    super(message);

    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = error;
  }
}
