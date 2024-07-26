import { InvitationStatus, Organisation, User, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { getOrganisationById } from 'query/organisation';
import { createNewUser, getUserByEmail } from 'query/user';
import {
  CreateOrganisationSchema,
  GetOrganisationSchema,
  UpdateOrganisationSchema,
  AssignUserToOrganisationRole,
  confirmOrganisationInvitationSchema,
  InviteUserToOrganisationSchema,
} from 'schema/organisations';
import { sendOrganisationInvitation } from 'utils/email';

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

  // This shouldn't be possible due to organisation middleware
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

export const assignUserToRole = async (req: Request, res: Response) => {
  const validatedData = AssignUserToOrganisationRole.parse(req.body);

  const updatedUser = await prismaClient.organisationUser.update({
    where: {
      user_id_organisation_id: {
        user_id: validatedData.user_id,
        organisation_id: validatedData.organisation_id,
      },
    },
    data: {
      user_role: validatedData.user_role,
    },
  });

  if (!updatedUser) {
    throw new HttpException(
      ErrorMessage.USER_NOT_ORGANISATION,
      ErrorCode.USER_NOT_ORGANISATION,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  res.json(updatedUser);
};

export const inviteUserToOrganisation = async (req: Request, res: Response) => {
  const validatedBody = InviteUserToOrganisationSchema.parse(req.body);
  const [user, organisation]: [User, Organisation] = await Promise.all([
    getUserByEmail(validatedBody.user_email),
    getOrganisationById(validatedBody.organisation_id),
  ]);

  const organisationUser = await prismaClient.organisationUser.create({
    data: { user_id: user.id, organisation_id: validatedBody.organisation_id },
  });

  await sendOrganisationInvitation(
    validatedBody.user_email,
    organisation.name,
    validatedBody.organisation_id,
    user.id,
    `${req.protocol}://${req.get('host')}`,
  );

  res.json(organisationUser);
};

export const confirmOrganisationInvitation = async (req: Request, res: Response) => {
  const validatedBody = confirmOrganisationInvitationSchema.parse(req.body);
  let user = await prismaClient.user.findFirst({ where: { id: validatedBody.user_id } });

  if (!user) {
    const { email, name, password } = validatedBody;

    if (!email || !name || !password) {
      throw new HttpException(
        ErrorMessage.UNPROCESSABLE_ENTITY,
        ErrorCode.UNPROCESSABLE_ENTITY,
        StatusCode.UNPROCESSABLE_CONTENT,
        null,
      );
    }

    user = await createNewUser(email, name, password, `${req.protocol}://${req.get('host')}`);
  }

  const organisationUser = await prismaClient.organisationUser.update({
    where: {
      user_id_organisation_id: {
        user_id: user.id,
        organisation_id: validatedBody.organisation_id,
      },
      invitation_status: InvitationStatus.PENDING,
    },
    data: { invitation_status: InvitationStatus.ACCEPTED },
  });

  res.json(organisationUser);
};
