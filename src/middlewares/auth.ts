import { OrganisationUser, User } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { userModel } from 'models';
import { JWT_SECRET } from 'secrets';

declare module 'express' {
  interface Request {
    user?: User;
    userOrganisations?: OrganisationUser[];
  }
}

export const authMidd = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new Error();
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userData = await userModel.getUser(payload.userId);

    if (!userData) {
      throw new Error();
    } else if (!userData.user.is_verified) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    req.user = userData.user;
    req.userOrganisations = userData.userOrganisations;

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
        error,
      ),
    );
  }
};
