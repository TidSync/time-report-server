import { InvitationStatus, Organisation, OrganisationUser, User, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { getOrganisationById } from 'query/organisations';
import { createNewUser, getUserByEmail } from 'query/users';
import {
  AssignUserToOrganisationRole,
  confirmOrganisationInvitationSchema,
  InviteUserToOrganisationSchema,
  RemoveOrganisationUserSchema,
} from 'schema/organisations';
import { sendOrganisationInvitation } from 'utils/email';

export const assignUserToRole = async (req: Request, res: Response) => {
  const validatedData = AssignUserToOrganisationRole.parse(req.body);
  let updatedUser: OrganisationUser;

  if (validatedData.user_role === UserRole.OWNER) {
    if (req.orgUser!.user_role !== UserRole.OWNER) {
      throw new HttpException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.ORGANISATION_UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
        null,
      );
    }

    [updatedUser] = await prismaClient.$transaction([
      prismaClient.organisationUser.update({
        where: {
          user_id_organisation_id: {
            user_id: validatedData.user_id,
            organisation_id: validatedData.organisation_id,
          },
        },
        data: {
          user_role: validatedData.user_role,
        },
      }),
      prismaClient.organisationUser.update({
        where: {
          user_id_organisation_id: {
            user_id: req.user!.id,
            organisation_id: validatedData.organisation_id,
          },
        },
        data: {
          user_role: UserRole.ADMIN,
        },
      }),
    ]);
  } else {
    updatedUser = await prismaClient.organisationUser.update({
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
  }

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

export const getOrganisationUsers = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany({
    where: { organisation_user: { some: { organisation_id: req.params.organisation_id } } },
  });

  res.json(users);
};

export const removeOrganisationUser = async (req: Request, res: Response) => {
  const validatedBody = RemoveOrganisationUserSchema.parse(req.body);

  const userToDelete = await prismaClient.organisationUser.findFirstOrThrow({
    where: { organisation_id: validatedBody.organisation_id, user_id: validatedBody.user_id },
  });

  if (userToDelete.user_role === UserRole.OWNER) {
    throw new HttpException(
      ErrorMessage.CANNOT_DELETE_OWNER,
      ErrorCode.CANNOT_DELETE_OWNER,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  await prismaClient.organisationUser.delete({
    where: {
      user_id_organisation_id: {
        user_id: validatedBody.user_id,
        organisation_id: validatedBody.organisation_id,
      },
    },
  });

  res.json();
};
