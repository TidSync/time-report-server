import { prismaClient } from 'index';
import { Prisma } from '@prisma/client';
import {
  addRedisArrayData,
  deleteRedisArrayData,
  deleteRedisData,
  getOrSetRedisData,
  setRedisData,
} from 'utils/redis';

export const createOrganisation = async (user_id: string, data: Prisma.OrganisationCreateInput) => {
  const organisation = await setRedisData(['organisation', '$id'], () =>
    prismaClient.organisation.create({
      data,
      include: { organisation_user: { where: { user_id: user_id } } },
    }),
  );

  addRedisArrayData(`userOrganisations:${user_id}`, organisation.organisation_user[0]);

  return organisation;
};

export const updateOrganisation = async (
  organisation_id: string,
  updateData: Prisma.OrganisationUncheckedUpdateInput,
) => {
  return setRedisData([`organisation:${organisation_id}`], () =>
    prismaClient.organisation.update({ where: { id: organisation_id }, data: updateData }),
  );
};

export const updateOrganisations = async (
  where: Prisma.OrganisationWhereInput,
  data: Prisma.OrganisationUpdateInput,
) => {
  await prismaClient.organisation.updateMany({ where, data });

  const organisations = await prismaClient.organisation.findMany({ where });

  organisations.forEach((org) =>
    setRedisData([`organisation:${org.id}`], () => new Promise((resolve) => resolve(org))),
  );

  return organisations;
};

export const deleteOrganisation = async (organisation_id: string) => {
  deleteRedisData(`organisation:${organisation_id}`);
  deleteRedisArrayData(`userOrganisations:${organisation_id}`, {
    organisation_id: [organisation_id],
  });

  return prismaClient.organisation.delete({ where: { id: organisation_id } });
};

export const getOrganisationByProjectId = async (id: string) => {
  return prismaClient.organisation.findFirst({ where: { projects: { some: { id } } } });
};

export const getOrganisation = async (id: string) => {
  return getOrSetRedisData(
    { organisation: `organisation:${id}`, addresses: `addresses:${id}` },
    async () => {
      const organisation = await prismaClient.organisation.findFirst({
        where: { id },
        include: { addresses: { orderBy: { is_default: 'desc' } } },
      });

      if (!organisation) {
        return organisation;
      }

      const { addresses, ...organisationData } = organisation;

      return { organisation: organisationData, addresses };
    },
  );
};
