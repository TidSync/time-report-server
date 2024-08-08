import { Prisma, UserRole } from '@prisma/client';
import { prismaClient } from 'index';

export const createOrganisationUser = async (user_id: string, organisation_id: string) => {
  return prismaClient.organisationUser.create({ data: { user_id, organisation_id } });
};

export const updateOrganisationUser = async (
  user_id: string,
  organisation_id: string,
  updateData: Prisma.OrganisationUserUncheckedUpdateInput,
) => {
  return prismaClient.organisationUser.update({
    where: { user_id_organisation_id: { user_id, organisation_id } },
    data: updateData,
  });
};

export const deleteOrganisationUser = async (user_id: string, organisation_id: string) => {
  return prismaClient.organisationUser.delete({
    where: { user_id_organisation_id: { user_id, organisation_id } },
  });
};

export const getOrganisationUser = async (user_id: string, organisation_id: string) => {
  return prismaClient.organisationUser.findFirst({ where: { user_id, organisation_id } });
};

export const getOrganisationUsers = async (organisation_id: string) => {
  return prismaClient.organisationUser.findMany({
    where: { organisation_id },
    include: { user: true },
  });
};

export const assignOwnerRole = async (
  user_to_promote: string,
  user_to_demote: string,
  organisation_id: string,
) => {
  return prismaClient.$transaction([
    prismaClient.organisationUser.update({
      where: { user_id_organisation_id: { user_id: user_to_promote, organisation_id } },
      data: { user_role: UserRole.OWNER },
    }),
    prismaClient.organisationUser.update({
      where: { user_id_organisation_id: { user_id: user_to_demote, organisation_id } },
      data: { user_role: UserRole.ADMIN },
    }),
  ]);
};
