import { Request, Response, NextFunction } from 'express';
import { HttpException } from 'exceptions/http-exception';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { InvitationStatus, OrganisationUser, UserRole } from '@prisma/client';

declare module 'express' {
  interface Request {
    orgUser?: OrganisationUser;
  }
}

const runMiddlewareWithFilter = (
  req: Request,
  next: NextFunction,
  filter: (orgUser: OrganisationUser, organisationId: string) => boolean,
) => {
  try {
    const organisationId = req.body.organisation_id || req.params.organisation_id;

    if (!organisationId) {
      throw new Error();
    }

    const orgUser = req.user!.organisation_user.find((organisationUser) =>
      filter(organisationUser, organisationId),
    );

    if (!orgUser) {
      throw new Error();
    } else if (orgUser.invitation_status === InvitationStatus.PENDING) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    req.orgUser = orgUser;

    next();
  } catch (error: any) {
    if (error.message === ErrorMessage.USER_NOT_VERIFIED) {
      return next(
        new HttpException(
          ErrorMessage.USER_NOT_VERIFIED,
          ErrorCode.ORGANISATION_UNVERIFIED,
          StatusCode.UNAUTHORIZED,
          error,
        ),
      );
    }

    next(
      new HttpException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.ORGANISATION_UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        error,
      ),
    );
  }
};

export const orgUserMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(req, next, (orgUser, orgId) => orgUser.organisation_id === orgId);
};

export const orgProjectManagerMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) =>
      ([UserRole.OWNER, UserRole.ADMIN, UserRole.PROJECT_MANAGER] as UserRole[]).includes(
        orgUser.user_role,
      ) && orgUser.organisation_id === orgId,
  );
};

export const orgAdminMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) =>
      ([UserRole.OWNER, UserRole.ADMIN] as UserRole[]).includes(orgUser.user_role) &&
      orgUser.organisation_id === orgId,
  );
};

export const orgOwnerMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) => orgUser.user_role === UserRole.OWNER && orgUser.organisation_id === orgId,
  );
};
