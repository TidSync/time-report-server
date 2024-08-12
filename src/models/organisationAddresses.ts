import { OrganisationAddress, Prisma } from '@prisma/client';
import { prismaClient } from 'index';
import { deleteRedisData, getOrSetRedisData } from 'utils/redis';

const updateAddressToDefault = (address: OrganisationAddress) => {
  return prismaClient.organisationAddress.updateMany({
    where: {
      NOT: { id: address.id },
      organisation_id: address.organisation_id,
      is_default: true,
    },
    data: { is_default: false },
  });
};

export const createAddress = async (data: Prisma.OrganisationAddressUncheckedCreateInput) => {
  deleteRedisData(`addresses:${data.organisation_id}`);

  const address = await prismaClient.organisationAddress.create({ data });

  if (data.is_default) {
    await updateAddressToDefault(address);
  }

  return address;
};

export const deleteAddress = async (organisation_address_id: string, organisation_id: string) => {
  deleteRedisData(`addresses:${organisation_id}`);

  return prismaClient.organisationAddress.delete({ where: { id: organisation_address_id } });
};

export const updateAddress = async (
  organisation_address_id: string,
  organisation_id: string,
  updateData: Prisma.OrganisationAddressUncheckedUpdateInput,
) => {
  deleteRedisData(`addresses:${organisation_id}`);

  const address = await prismaClient.organisationAddress.update({
    where: { id: organisation_address_id },
    data: updateData,
  });

  if (address.is_default) {
    await updateAddressToDefault(address);
  }

  return address;
};

export const getAddress = async (organisation_address_id: string) => {
  return prismaClient.organisationAddress.findFirst({ where: { id: organisation_address_id } });
};

export const getAddresses = async (organisation_id: string) => {
  return getOrSetRedisData(`addresses:${organisation_id}`, () =>
    prismaClient.organisationAddress.findMany({
      where: { organisation_id },
      orderBy: { is_default: 'desc' },
    }),
  );
};
