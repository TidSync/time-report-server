import { OrganisationRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { Request, Response } from 'express';
import { prismaClient } from 'index';
import { AssignUserToOrganisationRole, UpdateUserSchema } from 'schema/users';

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

export const assignUserToRole = async (req: Request, res: Response) => {
  const validatedData = AssignUserToOrganisationRole.parse(req.body);
  let role: OrganisationRole;

  try {
    role = await prismaClient.organisationRole.findFirstOrThrow({
      where: { org_id: validatedData.organisation_id, id: validatedData.role_id },
    });
  } catch (error) {
    throw new HttpException(
      ErrorMessage.ROLE_NOT_FOUND,
      ErrorCode.ROLE_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  prismaClient.user.update({
    where: { id: validatedData.user_id },
    data: { organisation_roles: { connect: { id: role.id } } },
  });

  res.json();
};
