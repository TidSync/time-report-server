import { TokenType } from '@prisma/client';
import { prismaClient } from 'index';

export const createUserToken = async (user_id: string, token: string, token_type: TokenType) => {
  return prismaClient.userToken.create({
    data: { token, user_id, token_type },
  });
};

export const getUserToken = async (token: string, token_type: TokenType) => {
  return prismaClient.userToken.findFirst({
    where: { token, token_type, expires_at: { gt: new Date() } },
  });
};
