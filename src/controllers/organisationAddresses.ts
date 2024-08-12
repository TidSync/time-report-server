import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { organisationAddressModel } from 'models';
import { sendResponse } from 'response-hook';
import {
  CreateOrganisationAddressSchema,
  DeleteOrganisationAddressSchema,
  GetOrganisationAddressesSchema,
  UpdateOrganisationAddressSchema,
} from 'schema/organisations';

export const createAddress = async (req: Request, res: Response) => {
  const validatedBody = CreateOrganisationAddressSchema.parse(req.body);
  const address = await organisationAddressModel.createAddress(validatedBody);

  sendResponse(res, address);
};

export const updateAddress = async (req: Request, res: Response) => {
  const { organisation_address_id, ...updateData } = UpdateOrganisationAddressSchema.parse(
    req.body,
  );

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const address = await organisationAddressModel.updateAddress(
    organisation_address_id,
    req.orgUser!.organisation_id,
    updateData,
  );

  sendResponse(res, address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  const validatedBody = DeleteOrganisationAddressSchema.parse(req.body);

  await organisationAddressModel.deleteAddress(
    validatedBody.organisation_address_id,
    req.orgUser!.organisation_id,
  );

  sendResponse(res);
};

export const getAddresses = async (req: Request, res: Response) => {
  const validatedParams = GetOrganisationAddressesSchema.parse(req.params);

  const addresses = await organisationAddressModel.getAddresses(validatedParams.organisation_id);

  sendResponse(res, addresses);
};
