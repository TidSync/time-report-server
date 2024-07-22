import { Request, Response, NextFunction } from 'express';
import { HttpException } from 'exceptions/http-exception';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { InvitationStatus, UserRole } from '@prisma/client';

export const organisationUserMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const organisationId = req.body.organisation_id || req.params.organisation_id;
    const isOrgUser = req.user!.organisation_user.find(
      (orgUser) => orgUser.organisation_id === organisationId,
    );

    if (!isOrgUser) {
      throw new Error();
    } else if (isOrgUser.invitation_status === InvitationStatus.PENDING) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    next();
  } catch (error: any) {
    if (error.message === ErrorMessage.USER_NOT_VERIFIED) {
      return next(
        new HttpException(
          ErrorMessage.USER_NOT_VERIFIED,
          ErrorCode.ORGANISATION_UNVERIFIED,
          StatusCode.UNAUTHORIZED,
          null,
        ),
      );
    }

    next(
      new HttpException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.ORGANISATION_UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        null,
      ),
    );
  }
};

export const organisationAdminMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const organisationId = req.body.organisation_id || req.params.organisation_id;
    const isOrgAdmin = req.user!.organisation_user.find(
      (orgUser) =>
        orgUser.user_role === UserRole.ADMIN && orgUser.organisation_id === organisationId,
    );

    if (!isOrgAdmin) {
      throw new Error();
    } else if (isOrgAdmin.invitation_status === InvitationStatus.PENDING) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    next();
  } catch (error: any) {
    if (error.message === ErrorMessage.USER_NOT_VERIFIED) {
      return next(
        new HttpException(
          ErrorMessage.USER_NOT_VERIFIED,
          ErrorCode.ORGANISATION_UNVERIFIED,
          StatusCode.UNAUTHORIZED,
          null,
        ),
      );
    }

    next(
      new HttpException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.ORGANISATION_UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        null,
      ),
    );
  }
};
