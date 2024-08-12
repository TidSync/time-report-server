import { prismaClient } from 'index';
import { encryptPassword } from 'utils/password';
import { Prisma, TokenType, UserRole } from '@prisma/client';
import { sendVerificationEmail } from 'utils/email';
import { createValidationToken } from 'utils/token';
import Chance from 'chance';
import {
  getOrSetRedisData,
  deleteRedisData,
  setRedisData,
  updateRedisArrayData,
} from 'utils/redis';

const chance = new Chance();

export const createUser = async (
  email: string,
  name: string,
  password: string,
  targetUrl: string,
) => {
  const verificationToken = createValidationToken();

  const user = await setRedisData(['user', '$id'], () =>
    prismaClient.user.create({
      data: {
        name,
        email,
        password: encryptPassword(password),
        user_token: { create: { token: verificationToken, token_type: TokenType.VERIFY_EMAIL } },
      },
    }),
  );

  await sendVerificationEmail(email, name, verificationToken, targetUrl);

  return user;
};

export const deleteUser = async (user_id: string) => {
  deleteRedisData(`user:${user_id}`);

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
  return setRedisData([`user:${id}`], async () => {
    {
      const userData = await prismaClient.user.update({
        where: { id, is_deleted: false },
        data: updateData,
        include: { projects: { select: { id: true } }, teams: { select: { id: true } } },
      });

      const { projects, teams, ...user } = userData;

      projects.forEach((project) =>
        updateRedisArrayData(`projectUsers:${project.id}`, { id: user.id }, () =>
          Promise.resolve(user),
        ),
      );
      teams.forEach((team) =>
        updateRedisArrayData(`teamUsers:${team.id}`, { id: user.id }, () => Promise.resolve(user)),
      );

      return user;
    }
  });
};

export const getUser = async (id: string) => {
  return getOrSetRedisData(
    { user: `user:${id}`, userOrganisations: `userOrganisations:${id}` },
    async () => {
      const user = await prismaClient.user.findFirst({
        where: { id, is_deleted: false },
        include: { organisation_user: true },
      });

      if (!user) {
        return user;
      }

      const { organisation_user, ...userData } = user;

      return { user: userData, userOrganisations: organisation_user };
    },
  );
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
  return getOrSetRedisData(`projectUsers:${project_id}`, () =>
    prismaClient.user.findMany({
      where: { projects: { some: { id: project_id } }, is_deleted: false },
    }),
  );
};

export const getTeamUsers = async (team_id: string) => {
  return getOrSetRedisData(`teamUsers:${team_id}`, () =>
    prismaClient.user.findMany({
      where: { teams: { some: { id: team_id } }, is_deleted: false },
    }),
  );
};
