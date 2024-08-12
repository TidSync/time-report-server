import { Prisma, User, UserRole } from '@prisma/client';
import { prismaClient } from 'index';
import { canSeeAllUnderProjectEntities } from 'utils/permissions';
import {
  addRedisArrayData,
  deleteRedisArrayData,
  deleteRedisData,
  getOrSetRedisData,
  setRedisData,
} from 'utils/redis';

export const createTeam = async (data: Prisma.TeamUncheckedCreateInput) => {
  return setRedisData(['team', '$id'], () =>
    prismaClient.team.create({ data, include: { users: { select: { id: true } } } }),
  );
};

export const updateTeam = async (team_id: string, updateData: Prisma.TeamUncheckedUpdateInput) => {
  return setRedisData([`team:${team_id}`], () =>
    prismaClient.team.update({
      where: { id: team_id },
      data: updateData,
      include: { users: { select: { id: true } } },
    }),
  );
};

export const deleteTeam = async (team_id: string) => {
  deleteRedisData(`team:${team_id}`);

  return prismaClient.team.delete({ where: { id: team_id } });
};

export const getTeam = async (team_id: string) => {
  return getOrSetRedisData(
    { team: `team:${team_id}`, teamUsers: `teamUsers:${team_id}` },
    async () => {
      const teamData = await prismaClient.team.findFirst({
        where: { id: team_id },
        include: { users: true },
      });

      if (!teamData) {
        return teamData;
      }

      const { users, ...team } = teamData;

      return { team, teamUsers: users };
    },
  );
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

export const addTeamUser = (team_id: string, user: User) => {
  addRedisArrayData(`teamUsers:${team_id}`, user);

  return updateTeam(team_id, { users: { connect: { id: user.id } } });
};

export const removeTeamUser = (team_id: string, user_id: string) => {
  deleteRedisArrayData(team_id, { id: [user_id] });

  return updateTeam(team_id, {
    users: { disconnect: { id: user_id } },
  });
};
