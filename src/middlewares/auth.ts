import { User } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';
import { prismaClient } from 'index';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'secrets';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new Error();
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;

    const user = await prismaClient.user.findFirst({ where: { id: payload.userId } });

    if (!user) {
      throw new Error();
    } else if (!user.is_verified) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.message === ErrorMessage.USER_NOT_VERIFIED) {
      return next(
        new HttpException(
          ErrorMessage.USER_NOT_VERIFIED,
          ErrorCode.UNVERIFIED,
          StatusCode.UNAUTHORIZED,
          null,
        ),
      );
    }

    next(
      new HttpException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        null,
      ),
    );
  }
};
