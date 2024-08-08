import { prismaClient } from 'index';
import { encryptPassword } from 'utils/password';
import { Prisma, TokenType, UserRole } from '@prisma/client';
import { sendVerificationEmail } from 'utils/email';
import { createValidationToken } from 'utils/token';
import Chance from 'chance';

const chance = new Chance();

export const createUser = async (
  email: string,
  name: string,
  password: string,
  targetUrl: string,
) => {
  const verificationToken = createValidationToken();

  const user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: encryptPassword(password),
      user_token: { create: { token: verificationToken, token_type: TokenType.VERIFY_EMAIL } },
    },
  });

  await sendVerificationEmail(email, name, verificationToken, targetUrl);

  return user;
};

export const deleteUser = async (user_id: string) => {
  return prismaClient.$transaction([
    prismaClient.user.update({
      where: { id: user_id },
      data: {
        email: chance.email({ domain: 'deleted.com' }),
        password: encryptPassword(chance.string()),
        name: 'deleted_user',
        is_verified: false,
        is_deleted: true,
      },
    }),
    prismaClient.organisation.deleteMany({
      where: { organisation_user: { some: { user_id, user_role: UserRole.OWNER } } },
    }),
  ]);
};

export const updateUser = async (id: string, updateData: Prisma.UserUncheckedUpdateInput) => {
  return prismaClient.user.update({ where: { id, is_deleted: false }, data: updateData });
};

export const getUser = async (id: string) => {
  return prismaClient.user.findFirst({
    where: { id, is_deleted: false },
    include: { organisation_user: true },
  });
};

export const getUserByEmail = async (email: string) => {
  return prismaClient.user.findFirst({ where: { email, is_deleted: false } });
};

export const getUserInOrganisation = async (user_id: string, organisation_id: string) => {
  return prismaClient.user.findFirst({
    where: { id: user_id, is_deleted: false, organisation_user: { some: { organisation_id } } },
  });
};

export const getProjectUsers = async (project_id: string) => {
  return prismaClient.user.findMany({
    where: { projects: { some: { id: project_id } }, is_deleted: false },
  });
};

export const getTeamUsers = async (team_id: string) => {
  return prismaClient.user.findMany({
    where: { teams: { some: { id: team_id } }, is_deleted: false },
  });
};
