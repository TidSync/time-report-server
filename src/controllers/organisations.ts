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
} from 'schema/organisations';

export const createOrganisation = async (req: Request, res: Response) => {
  const validatedData = CreateOrganisationSchema.parse(req.body);

  const organisation = await prismaClient.organisation.create({
    data: {
      name: validatedData.name,
      organisation_user: {
        create: {
          user_id: req.user!.id,
          user_role: UserRole.ADMIN,
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
  const validatedBody = UpdateOrganisationSchema.parse(req.body);

  const organisation = await prismaClient.organisation.update({
    where: { id: validatedBody.organisation_id },
    data: { name: validatedBody.name },
  });

  if (!organisation) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_NOT_FOUND,
      ErrorCode.ORGANISATION_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  res.json(organisation);
};
