import { InvitationStatus, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { organisationModel } from 'models';
import { sendResponse } from 'response-hook';
import {
  CreateOrganisationSchema,
  GetOrganisationSchema,
  UpdateOrganisationSchema,
  RemoveOrganisationSchema,
} from 'schema/organisations';

export const createOrganisation = async (req: Request, res: Response) => {
  const validatedData = CreateOrganisationSchema.parse(req.body);

  const organisation = await organisationModel.createOrganisation({
    name: validatedData.name,
    organisation_user: {
      create: {
        user_id: req.user!.id,
        user_role: UserRole.OWNER,
        invitation_status: InvitationStatus.ACCEPTED,
      },
    },
  });

  sendResponse(res, organisation);
};

export const getOrganisation = async (req: Request, res: Response) => {
  const validatedParams = GetOrganisationSchema.parse(req.params);

  const organisation = await organisationModel.getOrganisation(validatedParams.organisation_id);

  if (!organisation) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_NOT_FOUND,
      ErrorCode.ORGANISATION_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  sendResponse(res, organisation);
};

export const updateOrganisation = async (req: Request, res: Response) => {
  const { organisation_id, ...updateData } = UpdateOrganisationSchema.parse(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new HttpException(
      ErrorMessage.UPDATE_DATA_MISSING,
      ErrorCode.UPDATE_DATA_MISSING,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  const organisation = await organisationModel.updateOrganisation(organisation_id, updateData);

  sendResponse(res, organisation);
};

export const removeOrganisation = async (req: Request, res: Response) => {
  const validatedBody = RemoveOrganisationSchema.parse(req.body);

  await organisationModel.deleteOrganisation(validatedBody.organisation_id);

  sendResponse(res);
};
