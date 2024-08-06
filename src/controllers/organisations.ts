import { InvitationStatus, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  CreateOrganisationSchema,
  GetOrganisationSchema,
  UpdateOrganisationSchema,
  RemoveOrganisationSchema,
} from 'schema/organisations';

export const createOrganisation = async (req: Request, res: Response) => {
  const validatedData = CreateOrganisationSchema.parse(req.body);

  const organisation = await prismaClient.organisation.create({
    data: {
      name: validatedData.name,
      organisation_user: {
        create: {
          user_id: req.user!.id,
          user_role: UserRole.OWNER,
          invitation_status: InvitationStatus.ACCEPTED,
        },
      },
    },
  });

  res.json(organisation);
};

export const getOrganisation = async (req: Request, res: Response) => {
  const validatedParams = GetOrganisationSchema.parse(req.params);

  try {
    const organisation = await prismaClient.organisation.findFirstOrThrow({
      where: { id: validatedParams.organisation_id },
      include: { addresses: { where: { is_default: true } } },
    });

    res.json(organisation);
  } catch (error) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_NOT_FOUND,
      ErrorCode.ORGANISATION_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }
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

  const organisation = await prismaClient.organisation.update({
    where: { id: organisation_id },
    data: updateData,
  });

  res.json(organisation);
};

export const removeOrganisation = async (req: Request, res: Response) => {
  const validatedBody = RemoveOrganisationSchema.parse(req.body);

  await prismaClient.organisation.delete({ where: { id: validatedBody.organisation_id } });

  res.json();
};
