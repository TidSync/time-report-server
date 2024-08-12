import { InvitationStatus, Prisma, UserRole } from '@prisma/client';
import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import { prismaClient } from 'index';
import { encryptPassword } from 'utils/password';
import { deleteRedisData, getOrSetRedisData, setRedisData } from 'utils/redis';

export const createOrganisationUser = async (user_id: string, organisation_id: string) => {
  return setRedisData([`organisationUser:${organisation_id}:${user_id}`], () =>
    prismaClient.organisationUser.create({ data: { user_id, organisation_id } }),
  );
};

export const updateOrganisationUser = async (
  user_id: string,
  organisation_id: string,
  updateData: Prisma.OrganisationUserUncheckedUpdateInput,
) => {
  return setRedisData([`organisationUser:${organisation_id}:${user_id}`], () =>
    prismaClient.organisationUser.update({
      where: { user_id_organisation_id: { user_id, organisation_id } },
      data: updateData,
    }),
  );
};

export const deleteOrganisationUser = async (user_id: string, organisation_id: string) => {
  deleteRedisData(`organisationUser:${organisation_id}:${user_id}`);

  return prismaClient.organisationUser.delete({
    where: { user_id_organisation_id: { user_id, organisation_id } },
  });
};

export const getOrganisationUser = async (user_id: string, organisation_id: string) => {
  return getOrSetRedisData(`organisationUser:${organisation_id}:${user_id}`, () =>
    prismaClient.organisationUser.findFirst({ where: { user_id, organisation_id } }),
  );
};

export const getOrganisationUsers = async (organisation_id: string) => {
  return prismaClient.organisationUser.findMany({
    where: { organisation_id },
    include: { user: true },
  });
};

export const assignOwnerRole = async (
  user_to_promote: string,
  user_to_demote: string,
  organisation_id: string,
) => {
  return prismaClient.$transaction((tx) => {
    return Promise.all([
      setRedisData([`organisationUser:${organisation_id}:${user_to_promote}`], () =>
        tx.organisationUser.update({
          where: { user_id_organisation_id: { user_id: user_to_promote, organisation_id } },
          data: { user_role: UserRole.OWNER },
        }),
      ),
      setRedisData([`organisationUser:${organisation_id}:${user_to_demote}`], () =>
        tx.organisationUser.update({
          where: { user_id_organisation_id: { user_id: user_to_demote, organisation_id } },
          data: { user_role: UserRole.ADMIN },
        }),
      ),
    ]);
  });
};

export const confirmOrganisationInvitation = async (
  user_id: string,
  organisation_id: string,
  userData: { name?: string; password?: string },
) => {
  return prismaClient.$transaction(async (tx) => {
    const organisationUser = await getOrSetRedisData(
      `organisationUser:${organisation_id}:${user_id}`,
      () =>
        tx.organisationUser.findFirstOrThrow({
          where: { organisation_id, user_id },
          include: { user: true },
        }),
    );
    let user = organisationUser.user;

    if (organisationUser.invitation_status !== InvitationStatus.PENDING) {
      throw new HttpException(
        ErrorMessage.USER_ALREADY_VERIFIED,
        ErrorCode.ORGANISATION_USER_ALREADY_VERIFIED,
        StatusCode.BAD_REQUEST,
        null,
      );
    }

    if (!organisationUser.user.name) {
      if (!userData.name || !userData.password) {
        throw new HttpException(
          ErrorMessage.USER_INFO_MISSING,
          ErrorCode.USER_INFO_MISSING,
          StatusCode.UNPROCESSABLE_CONTENT,
          null,
        );
      }

      user = await setRedisData([`user:${user_id}`], () =>
        tx.user.update({
          where: { id: organisationUser.user_id },
          data: {
            name: userData.name,
            password: encryptPassword(userData.password!),
            is_verified: true,
            user_token: { deleteMany: { user_id } },
          },
        }),
      );
    }

    setRedisData([`organisationUser:${organisation_id}:${user_id}`], () =>
      tx.organisationUser.update({
        where: {
          user_id_organisation_id: { user_id, organisation_id },
          invitation_status: InvitationStatus.PENDING,
        },
        data: { invitation_status: InvitationStatus.ACCEPTED },
        include: { user: true },
      }),
    );

    return user;
  });
};
