import { Request, Response, NextFunction } from 'express';
import { HttpException } from 'exceptions/http-exception';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { InvitationStatus, OrganisationUser, Project, Team, UserRole } from '@prisma/client';
import { getUserOrganisation } from 'query/organisations';

declare module 'express' {
  interface Request {
    orgUser?: OrganisationUser;
    project?: Project & { users: { id: string }[] };
    team?: Team & { users: { id: string }[] };
  }
}

const runMiddlewareWithFilter = async (
  req: Request,
  next: NextFunction,
  filter: (orgUser: OrganisationUser, organisationId: string) => boolean,
) => {
  try {
    const { organisationId, ...userOrgData } = await getUserOrganisation(req);

    const orgUser = req.user!.organisation_user.find((organisationUser) =>
      filter(organisationUser, organisationId),
    );

    if (!orgUser) {
      throw new Error();
    } else if (orgUser.invitation_status === InvitationStatus.PENDING) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    req.project = userOrgData.project;
    req.team = userOrgData.team;
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
    } else if (error.message === ErrorMessage.PROJECT_NOT_FOUND) {
      return next(
        new HttpException(
          ErrorMessage.PROJECT_NOT_FOUND,
          ErrorCode.PROJECT_NOT_FOUND,
          StatusCode.NOT_FOUND,
          null,
        ),
      );
    } else if (error.message === ErrorMessage.TEAM_NOT_FOUND) {
      return next(
        new HttpException(
          ErrorMessage.TEAM_NOT_FOUND,
          ErrorCode.TEAM_NOT_FOUND,
          StatusCode.NOT_FOUND,
          null,
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

export const isOrgUser = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(req, next, (orgUser, orgId) => orgUser.organisation_id === orgId);
};

export const isOrgPM = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) =>
      ([UserRole.OWNER, UserRole.ADMIN, UserRole.PROJECT_MANAGER] as UserRole[]).includes(
        orgUser.user_role,
      ) && orgUser.organisation_id === orgId,
  );
};

export const isOrgAdmin = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) =>
      ([UserRole.OWNER, UserRole.ADMIN] as UserRole[]).includes(orgUser.user_role) &&
      orgUser.organisation_id === orgId,
  );
};

export const isOrgOwner = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) => UserRole.OWNER === orgUser.user_role && orgUser.organisation_id === orgId,
  );
};
