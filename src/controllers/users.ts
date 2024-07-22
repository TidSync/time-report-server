import { InvitationStatus, Organisation, User } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { getOrganisationById } from 'query/organisation';
import { createNewUser, getUserByEmail } from 'query/user';
import {
  AssignUserToOrganisationRole,
  confirmOrganisationInvitationSchema,
  InviteUserToOrganisationSchema,
  UpdateUserSchema,
} from 'schema/users';
import { sendOrganisationInvitation } from 'utils/email';

export const updateUser = async (req: Request, res: Response) => {
  const validatedData = UpdateUserSchema.parse(req.body);

  const updatedUser = await prismaClient.user.update({
    where: { id: req.user!.id },
    data: {
      ...(validatedData.name ? { name: validatedData.name } : {}),
    },
  });

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
