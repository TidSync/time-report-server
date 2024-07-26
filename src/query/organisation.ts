import { prismaClient } from 'index';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { ErrorMessage } from 'constants/api-messages';
import { HttpException } from 'exceptions/http-exception';

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
