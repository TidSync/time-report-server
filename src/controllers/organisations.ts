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
  UploadOrganisationPhotoSchema,
} from 'schema/organisations';
import { APP_URL } from 'secrets';
import fs from 'fs';
import sharp from 'sharp';

export const createOrganisation = async (req: Request, res: Response) => {
  const validatedData = CreateOrganisationSchema.parse(req.body);

  const organisation = await organisationModel.createOrganisation(req.user!.id, {
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

export const uploadOrganisationPhoto = async (req: Request, res: Response) => {
  const { organisation_id } = UploadOrganisationPhotoSchema.parse(req.body);

  try {
    if (!fs.existsSync('files/organisation')) {
      fs.mkdirSync('files/organisation', { recursive: true });
    }

    const [user] = await Promise.all([
      organisationModel.updateOrganisation(organisation_id, {
        photo: `${APP_URL}/files/organisation/${organisation_id}.jpeg`,
      }),
      sharp(req.file!.buffer)
        .resize(200, 200)
        .jpeg()
        .toFile(`files/organisation/${organisation_id}.jpeg`),
    ]);

    sendResponse(res, user);
  } catch (error) {
    throw new HttpException(
      ErrorMessage.ERROR_UPLOADING_IMAGE,
      ErrorCode.ERROR_UPLOADING_IMAGE,
      StatusCode.INTERNAL_SERVER_ERROR,
      error,
    );
  }
};

export const removeOrganisation = async (req: Request, res: Response) => {
  const validatedBody = RemoveOrganisationSchema.parse(req.body);

  await organisationModel.deleteOrganisation(validatedBody.organisation_id);

  sendResponse(res);
};
