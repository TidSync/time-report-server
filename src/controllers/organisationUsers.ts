import { OrganisationUser, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import {
  AssignUserToOrganisationRole,
  confirmOrganisationInvitationSchema,
  GetOrganisationUserSchema,
  InviteUserToOrganisationSchema,
  RemoveOrganisationUserSchema,
} from 'schema/organisations';
import { sendOrganisationInvitation } from 'utils/email';
import Chance from 'chance';
import { encryptPassword } from 'utils/password';
import { createSessionToken } from 'utils/token';
import { organisationModel, organisationUserModel, userModel } from 'models';
import { sendResponse } from 'response-hook';
import { APP_URL } from 'secrets';

const chance = new Chance();

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

    [updatedUser] = await organisationUserModel.assignOwnerRole(
      validatedData.user_id,
      req.user!.id,
      validatedData.organisation_id,
    );
  } else {
    updatedUser = await organisationUserModel.updateOrganisationUser(
      validatedData.user_id,
      validatedData.organisation_id,
      { user_role: validatedData.user_role },
    );
  }

  if (!updatedUser) {
    throw new HttpException(
      ErrorMessage.USER_NOT_ORGANISATION,
      ErrorCode.USER_NOT_ORGANISATION,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  sendResponse(res, updatedUser);
};

export const inviteUserToOrganisation = async (req: Request, res: Response) => {
  const validatedBody = InviteUserToOrganisationSchema.parse(req.body);
  let user = await userModel.getUserByEmail(validatedBody.user_email);

  if (!user) {
    user = await userModel.createUser(
      validatedBody.user_email,
      '',
      encryptPassword(chance.string()),
      APP_URL,
    );
  }

  const orgData = await organisationModel.getOrganisation(validatedBody.organisation_id);

  if (!orgData) {
    throw new HttpException(
      ErrorMessage.ORGANISATION_NOT_FOUND,
      ErrorCode.ORGANISATION_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  const organisationUser = organisationUserModel.createOrganisationUser(
    user.id,
    validatedBody.organisation_id,
  );

  await sendOrganisationInvitation(
    validatedBody.user_email,
    orgData.organisation.name,
    validatedBody.organisation_id,
    user.id,
    APP_URL,
  );

  sendResponse(res, organisationUser);
};

export const confirmOrganisationInvitation = async (req: Request, res: Response) => {
  const { user_id, organisation_id, ...userData } = confirmOrganisationInvitationSchema.parse(
    req.body,
  );

  const transaction = await organisationUserModel.confirmOrganisationInvitation(
    user_id,
    organisation_id,
    userData,
  );

  const token = createSessionToken({ userId: transaction.id });

  sendResponse(res, { user: transaction, token });
};

export const getOrganisationUsers = async (req: Request, res: Response) => {
  const validatedParams = GetOrganisationUserSchema.parse(req.params);
  const users = await organisationUserModel.getOrganisationUsers(validatedParams.organisation_id);

  sendResponse(res, users);
};

export const removeOrganisationUser = async (req: Request, res: Response) => {
  const validatedBody = RemoveOrganisationUserSchema.parse(req.body);

  const userToDelete = await organisationUserModel.getOrganisationUser(
    validatedBody.user_id,
    validatedBody.organisation_id,
  );

  if (!userToDelete) {
    throw new HttpException(
      ErrorMessage.USER_NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  if (userToDelete.user_role === UserRole.OWNER) {
    throw new HttpException(
      ErrorMessage.CANNOT_DELETE_OWNER,
      ErrorCode.CANNOT_DELETE_OWNER,
      StatusCode.UNPROCESSABLE_CONTENT,
      null,
    );
  }

  await organisationUserModel.deleteOrganisationUser(
    validatedBody.user_id,
    validatedBody.organisation_id,
  );

  sendResponse(res);
};
