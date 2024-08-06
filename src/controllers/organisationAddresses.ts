import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  CreateOrganisationAddressSchema,
  DeleteOrganisationAddressSchema,
  GetOrganisationAddressesSchema,
  UpdateOrganisationAddressSchema,
} from 'schema/organisations';

export const createAddress = async (req: Request, res: Response) => {
  const validatedBody = CreateOrganisationAddressSchema.parse(req.body);

  const address = await prismaClient.organisationAddress.create({
    data: validatedBody,
  });

  if (validatedBody.is_default) {
    await prismaClient.organisationAddress.updateMany({
      where: {
        NOT: { id: address.id },
        organisation_id: validatedBody.organisation_id,
        is_default: true,
      },
      data: { is_default: false },
    });
  }

  res.json(address);
};

export const updateAddress = async (req: Request, res: Response) => {
  const { organisation_address_id, is_default, ...updateData } =
    UpdateOrganisationAddressSchema.parse(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const address = await prismaClient.organisationAddress.update({
    where: { id: organisation_address_id },
    data: {
      ...updateData,
      ...(typeof is_default === 'boolean' ? { is_default } : {}),
    },
  });

  res.json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  const validatedBody = DeleteOrganisationAddressSchema.parse(req.body);

  await prismaClient.organisationAddress.delete({
    where: { id: validatedBody.organisation_address_id },
  });

  res.json();
};

export const getAddresses = async (req: Request, res: Response) => {
  const validatedParams = GetOrganisationAddressesSchema.parse(req.params);

  const addresses = await prismaClient.organisationAddress.findMany({
    where: { organisation_id: validatedParams.organisation_id },
  });

  res.json(addresses);
};
