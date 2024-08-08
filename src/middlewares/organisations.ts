import { Request, Response, NextFunction } from 'express';
import { HttpException } from 'exceptions/http-exception';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import {
  InvitationStatus,
  OrganisationAddress,
  OrganisationUser,
  Project,
  Team,
  Timesheet,
  UserRole,
} from '@prisma/client';
import { FindOrganisationSchema } from 'schema/organisations';
import { organisationAddressModel, projectCategoryModel, projectModel, teamModel } from 'models';

declare module 'express' {
  interface Request {
    orgUser?: OrganisationUser;
    project?: Project & { users: { id: string }[] };
    team?: Team & { users: { id: string }[] };
    timesheet?: Timesheet;
    orgAddress?: OrganisationAddress;
  }
}

type UserOrganisationData = {
  organisationId: string;
  project?: Project & { users: { id: string }[] };
  team?: Team & { users: { id: string }[] };
  timesheet?: Timesheet;
  orgAddress?: OrganisationAddress;
};

const getUserOrganisation = async (req: Request): Promise<UserOrganisationData> => {
  const validatedData = FindOrganisationSchema.parse({ ...req.body, ...req.params });

  if (validatedData.organisation_id) {
    return { organisationId: validatedData.organisation_id };
  } else if (validatedData.project_id) {
    const project = await projectModel.getProject(validatedData.project_id);

    if (!project) {
      throw new HttpException(
        ErrorMessage.PROJECT_NOT_FOUND,
        ErrorCode.PROJECT_NOT_FOUND,
        StatusCode.NOT_FOUND,
        null,
      );
    }

    return { organisationId: project.organisation_id, project };
  } else if (validatedData.team_id) {
    const team = await teamModel.getTeam(validatedData.team_id);

    if (!team) {
      throw new HttpException(
        ErrorMessage.TEAM_NOT_FOUND,
        ErrorCode.TEAM_NOT_FOUND,
        StatusCode.NOT_FOUND,
        null,
      );
    }

    return { organisationId: team.organisation_id, team };
  } else if (validatedData.organisation_address_id) {
    const address = await organisationAddressModel.getAddress(
      validatedData.organisation_address_id,
    );

    if (!address) {
      throw new HttpException(
        ErrorMessage.ADDRESS_NOT_FOUND,
        ErrorCode.ADDRESS_NOT_FOUND,
        StatusCode.NOT_FOUND,
        null,
      );
    }

    return { organisationId: address.organisation_id, orgAddress: address };
  } else if (validatedData.project_category_id) {
    const projectCategory = await projectCategoryModel.getProjectCategory(
      validatedData.project_category_id,
    );

    if (!projectCategory) {
      throw new HttpException(
        ErrorMessage.PROJECT_CATEGORY_NOT_FOUND,
        ErrorCode.PROJECT_CATEGORY_NOT_FOUND,
        StatusCode.NOT_FOUND,
        null,
      );
    }

    return { organisationId: projectCategory.project.organisation_id };
  }

  throw new Error();
};

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
    if (error instanceof HttpException) {
      next(error);
    } else {
      next(
        new HttpException(
          ErrorMessage.UNAUTHORIZED,
          ErrorCode.ORGANISATION_UNAUTHORIZED,
          StatusCode.UNAUTHORIZED,
          error,
        ),
      );
    }
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
