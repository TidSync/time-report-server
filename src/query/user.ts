import { prismaClient } from 'index';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { ErrorMessage } from 'constants/api-messages';
import { HttpException } from 'exceptions/http-exception';
import { encryptPassword } from 'utils/password';
import { TokenType } from '@prisma/client';
import { sendVerificationEmail } from 'utils/email';
import { createValidationToken } from 'utils/token';

export const getUserByEmail = async (email: string) => {
  const user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    throw new HttpException(
      ErrorMessage.USER_NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  return user;
};

export const createNewUser = async (
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
      user_token: { create: { token: verificationToken, tokenType: TokenType.VERIFY_EMAIL } },
    },
  });

  await sendVerificationEmail(email, name, verificationToken, targetUrl);

  return user;
};
