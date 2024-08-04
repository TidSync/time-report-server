import { prismaClient } from 'index';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { ErrorMessage } from 'constants/api-messages';
import { HttpException } from 'exceptions/http-exception';
import { Request } from 'express';
import { FindOrganisationSchema } from 'schema/organisations';
import { Project, Team } from '@prisma/client';

export const getOrganisationById = async (id: string) => {
  const organisation = await prismaClient.organisation.findFirst({ where: { id } });

  if (!organisation) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_NOT_FOUND,
      ErrorCode.ORGANISATION_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  return organisation;
};

export const getOrganisationByProjectId = async (id: string) => {
  const project = await prismaClient.project.findFirst({
    where: { id },
    include: { organisation: true },
  });

  if (project) {
    return project.organisation;
  }

  return null;
};

type UserOrganisationData = {
  organisationId: string;
  project?: Project & { users: { id: string }[] };
  team?: Team & { users: { id: string }[] };
};

export const getUserOrganisation = async (req: Request): Promise<UserOrganisationData> => {
  const validatedData = FindOrganisationSchema.parse({ ...req.body, ...req.params });

  if (validatedData.organisation_id) {
    return { organisationId: validatedData.organisation_id };
  }

  if (validatedData.project_id) {
    const project = await prismaClient.project.findFirst({
      where: { id: validatedData.project_id },
      include: { users: { select: { id: true } } },
    });

    if (!project) {
      throw new Error(ErrorMessage.PROJECT_NOT_FOUND);
    }

    return { organisationId: project.organisation_id, project };
  }

  if (validatedData.team_id) {
    const team = await prismaClient.team.findFirst({
      where: { id: validatedData.team_id },
      include: { users: { select: { id: true } } },
    });

    if (!team) {
      throw new Error(ErrorMessage.TEAM_NOT_FOUND);
    }

    return { organisationId: team.organisation_id, team };
  }

  throw new Error(ErrorMessage.UNAUTHORIZED);
};
