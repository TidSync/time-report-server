import { InvitationStatus, OrganisationUser, Prisma, Project, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response, NextFunction } from 'express';
import { prismaClient } from 'index';

declare module 'express' {
  interface Request {
    project?: Project & { users: { id: string }[] };
  }
}

const runMiddlewareWithFilter = async (
  req: Request,
  next: NextFunction,
  filter: (orgUser: OrganisationUser, organisationId: string, usersList: string[]) => boolean,
) => {
  try {
    const projectId = req.body.project_id || req.params.project_id;

    if (!projectId) {
      throw new Error();
    }

    const project = await prismaClient.project.findFirstOrThrow({
      where: { id: projectId },
      include: { users: { select: { id: true } } },
    });

    const orgUser = req.user?.organisation_user.find((orgUser) =>
      filter(
        orgUser,
        project.organisation_id,
        project.users.map(({ id }) => id),
      ),
    );

    if (!orgUser) {
      throw new Error();
    } else if (orgUser.invitation_status === InvitationStatus.PENDING) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    req.project = project;
    req.orgUser = orgUser;

    next();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      next(
        new HttpException(
          ErrorMessage.PROJECT_NOT_FOUND,
          ErrorCode.PROJECT_NOT_FOUND,
          StatusCode.NOT_FOUND,
          null,
        ),
      );
    } else if (error.message === ErrorMessage.USER_NOT_VERIFIED) {
      next(
        new HttpException(
          ErrorMessage.USER_NOT_VERIFIED,
          ErrorCode.ORGANISATION_UNVERIFIED,
          StatusCode.UNAUTHORIZED,
          error,
        ),
      );
    } else {
      next(
        new HttpException(
          ErrorMessage.UNAUTHORIZED,
          ErrorCode.PROJECT_UNAUTHORIZED,
          StatusCode.UNAUTHORIZED,
          error,
        ),
      );
    }
  }
};

export const timesheetCreatorMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId, userList) =>
      orgUser.organisation_id === orgId && userList.includes(orgUser.user_id),
  );
};

export const projectUserMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(req, next, (orgUser, orgId, userList) => {
    if (orgUser.organisation_id !== orgId) {
      return false;
    }

    if (orgUser.user_role === UserRole.USER) {
      if (!userList.includes(orgUser.user_id)) {
        return false;
      }

      return true;
    }

    if (
      !([UserRole.PROJECT_MANAGER, UserRole.ADMIN, UserRole.OWNER] as UserRole[]).includes(
        orgUser.user_role,
      )
    ) {
      return false;
    }

    return true;
  });
};

export const projectManagerMidd = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(req, next, (orgUser, orgId, userList) => {
    if (orgUser.organisation_id !== orgId) {
      return false;
    }

    if (orgUser.user_role === UserRole.PROJECT_MANAGER) {
      if (!userList.includes(orgUser.user_id)) {
        return false;
      }

      return true;
    }

    if (!([UserRole.ADMIN, UserRole.OWNER] as UserRole[]).includes(orgUser.user_role)) {
      return false;
    }

    return true;
  });
};
