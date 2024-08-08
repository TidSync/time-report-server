import { Prisma } from '@prisma/client';
import { prismaClient } from 'index';

export const createAddress = async (data: Prisma.OrganisationAddressUncheckedCreateInput) => {
  const address = await prismaClient.organisationAddress.create({ data });

  if (data.is_default) {
    await prismaClient.organisationAddress.updateMany({
      where: {
        NOT: { id: address.id },
        organisation_id: address.organisation_id,
        is_default: true,
      },
      data: { is_default: false },
    });
  }

  return address;
};

export const deleteAddress = async (organisation_address_id: string) => {
  return prismaClient.organisationAddress.delete({ where: { id: organisation_address_id } });
};

export const updateAddress = async (
  organisation_address_id: string,
  updateData: Prisma.OrganisationAddressUncheckedUpdateInput,
) => {
  return prismaClient.organisationAddress.update({
    where: { id: organisation_address_id },
    data: updateData,
  });
};

export const getAddress = async (organisation_address_id: string) => {
  return prismaClient.organisationAddress.findFirst({ where: { id: organisation_address_id } });
};

export const getAddresses = async (organisation_id: string) => {
  return prismaClient.organisationAddress.findMany({
    where: { organisation_id },
    orderBy: { is_default: 'desc' },
  });
};
