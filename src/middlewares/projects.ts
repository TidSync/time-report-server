import {
  InvitationStatus,
  Organisation,
  OrganisationUser,
  Prisma,
  Project,
  UserRole,
} from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response, NextFunction } from 'express';
import { prismaClient } from 'index';

declare module 'express' {
  interface Request {
    project?: Project;
    organisation?: Organisation;
  }
}

const runMiddlewareWithFilter = async (
  req: Request,
  next: NextFunction,
  filter: (orgUser: OrganisationUser, organisationId: string) => boolean,
) => {
  try {
    const projectId = req.body.project_id || req.params.project_id;

    if (!projectId) {
      throw new Error();
    }

    const project = await prismaClient.project.findFirstOrThrow({
      where: { id: projectId },
      include: { organisation: true },
    });

    const orgUser = req.user?.organisation_user.find((orgUser) =>
      filter(orgUser, project.organisation.id),
    );

    if (!orgUser) {
      throw new Error();
    } else if (orgUser.invitation_status === InvitationStatus.PENDING) {
      throw new Error(ErrorMessage.USER_NOT_VERIFIED);
    }

    const { organisation, ...projectData } = project;

    req.project = projectData;
    req.organisation = organisation;
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

export const projectUserMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(req, next, (orgUser, orgId) => orgUser.organisation_id === orgId);
};

export const projectManagerMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  runMiddlewareWithFilter(
    req,
    next,
    (orgUser, orgId) =>
      orgUser.organisation_id === orgId &&
      (orgUser.user_role === UserRole.ADMIN || orgUser.user_role === UserRole.PROJECT_MANAGER),
  );
};
