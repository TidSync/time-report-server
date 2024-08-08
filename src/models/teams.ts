import { Prisma, UserRole } from '@prisma/client';
import { prismaClient } from 'index';
import { canSeeAllUnderProjectEntities } from 'utils/permissions';

export const createTeam = async (data: Prisma.TeamUncheckedCreateInput) => {
  return prismaClient.team.create({ data });
};

export const updateTeam = async (team_id: string, updateData: Prisma.TeamUncheckedUpdateInput) => {
  return prismaClient.team.update({ where: { id: team_id }, data: updateData });
};

export const deleteTeam = async (team_id: string) => {
  return prismaClient.team.delete({ where: { id: team_id } });
};

export const getTeam = async (team_id: string) => {
  return prismaClient.team.findFirst({
    where: { id: team_id },
    include: { users: { select: { id: true } } },
  });
};

export const listTeams = async (
  user_id: string,
  user_role: UserRole,
  organisation_id: string,
  cursor?: string,
) => {
  const areAllVisible = canSeeAllUnderProjectEntities(user_role);

  return prismaClient.team.findMany({
    where: {
      organisation_id: organisation_id,
      ...(areAllVisible ? {} : { users: { some: { id: user_id } } }),
    },
    orderBy: { created_at: 'desc' },
    take: 10,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
  });
};
