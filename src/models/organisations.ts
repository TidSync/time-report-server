import { prismaClient } from 'index';
import { InvitationStatus, Prisma, User } from '@prisma/client';
import { HttpException } from 'exceptions/http-exception';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { encryptPassword } from 'utils/password';

export const createOrganisation = async (data: Prisma.OrganisationCreateInput) => {
  return prismaClient.organisation.create({ data });
};

export const updateOrganisation = async (
  organisation_id: string,
  updateData: Prisma.OrganisationUncheckedUpdateInput,
) => {
  return prismaClient.organisation.update({ where: { id: organisation_id }, data: updateData });
};

export const deleteOrganisation = async (organisation_id: string) => {
  return prismaClient.organisation.delete({ where: { id: organisation_id } });
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

export const getOrganisation = async (id: string) => {
  const organisation = await prismaClient.organisation.findFirst({
    where: { id },
    include: { addresses: { where: { is_default: true } } },
  });

  return organisation;
};

export const confirmOrganisationInvitation = async (
  user_id: string,
  organisation_id: string,
  userData: { name?: string; password?: string },
) => {
  return prismaClient.$transaction(async (tx) => {
    const organisationUser = await tx.organisationUser.findFirstOrThrow({
      where: { organisation_id, user_id },
      include: { user: true },
    });
    let user = organisationUser.user;

    if (organisationUser.invitation_status !== InvitationStatus.PENDING) {
      throw new HttpException(
        ErrorMessage.USER_ALREADY_VERIFIED,
        ErrorCode.ORGANISATION_USER_ALREADY_VERIFIED,
        StatusCode.BAD_REQUEST,
        null,
      );
    }

    if (!organisationUser.user.name) {
      if (!userData.name || !userData.password) {
        throw new HttpException(
          ErrorMessage.USER_INFO_MISSING,
          ErrorCode.USER_INFO_MISSING,
          StatusCode.UNPROCESSABLE_CONTENT,
          null,
        );
      }

      user = await tx.user.update({
        where: { id: organisationUser.user_id },
        data: {
          name: userData.name,
          password: encryptPassword(userData.password),
          is_verified: true,
          user_token: { deleteMany: { user_id } },
        },
      });
    }

    await tx.organisationUser.update({
      where: {
        user_id_organisation_id: { user_id, organisation_id },
        invitation_status: InvitationStatus.PENDING,
      },
      data: { invitation_status: InvitationStatus.ACCEPTED },
    });

    return user;
  });
};
