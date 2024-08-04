import { Request, Response } from 'express';
import { prismaClient } from 'index';
import {
  LoginSchema,
  SignupSchema,
  BaseUserSchema,
  UserTokenSchema,
  ChangePasswordSchema,
  ResetPasswordSchema,
} from 'schema/auth';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { ErrorMessage } from 'constants/api-messages';
import { HttpException } from 'exceptions/http-exception';
import { sendResetPasswordEmail, sendVerificationEmail } from 'utils/email';
import { createSessionToken, createValidationToken } from 'utils/token';
import { TokenType, UserRole } from '@prisma/client';
import { encryptPassword, isPasswordCorrect } from 'utils/password';
import { createNewUser, getUserByEmail } from 'query/users';
import Chance from 'chance';

const chance = new Chance();

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = SignupSchema.parse(req.body);

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    throw new HttpException(
      ErrorMessage.USER_ALREADY_EXISTS,
      ErrorCode.USER_ALREADY_EXISTS,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  user = await createNewUser(email, name, password, `${req.protocol}://${req.get('host')}`);

  const sessionToken = createSessionToken({ userId: user.id });

  res.json({ user, token: sessionToken });
};

export const sendVerification = async (req: Request, res: Response) => {
  BaseUserSchema.parse(req.body);

  const { email } = req.body;

  const user = await getUserByEmail(email);
  const token = createValidationToken();

  await prismaClient.userToken.create({
    data: { token, user_id: user.id, tokenType: TokenType.VERIFY_EMAIL },
  });

  await sendVerificationEmail(user.email, user.name, token, `${req.protocol}://${req.get('host')}`);

  res.json();
};

export const verifyUser = async (req: Request, res: Response) => {
  UserTokenSchema.parse(req.params);

  const { token } = req.params;

  const userToken = await prismaClient.userToken.findFirst({
    where: {
      token,
      tokenType: TokenType.VERIFY_EMAIL,
      expires_at: { gt: new Date() },
    },
  });

  if (!userToken) {
    throw new HttpException(
      ErrorMessage.VERIFICATION_CODE_INVALID,
      ErrorCode.VERIFICATION_INVALID,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  await prismaClient.user.update({
    where: { id: userToken.user_id },
    data: {
      is_verified: true,
      user_token: { deleteMany: { user_id: userToken.user_id, tokenType: TokenType.VERIFY_EMAIL } },
    },
  });

  res.json();
};

export const login = async (req: Request, res: Response) => {
  LoginSchema.parse(req.body);

  const { email, password } = req.body;
  const user = await getUserByEmail(email);

  if (!isPasswordCorrect(password, user.password)) {
    throw new HttpException(
      ErrorMessage.INCORRECT_PASSWORD,
      ErrorCode.INCORRECT_PASSWORD,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  const token = createSessionToken({ userId: user.id });

  res.json({ user, token });
};

export const resetPassword = async (req: Request, res: Response) => {
  BaseUserSchema.parse(req.body);

  const { email } = req.body;
  const user = await getUserByEmail(email);

  const token = createValidationToken();

  await prismaClient.userToken.create({
    data: { token, user_id: user.id, tokenType: TokenType.RESET_PASSWORD },
  });

  await sendResetPasswordEmail(
    user.email,
    user.name,
    token,
    `${req.protocol}://${req.get('host')}`,
  );

  res.json();
};

export const verifyResetPassword = async (req: Request, res: Response) => {
  UserTokenSchema.parse(req.params);
  ResetPasswordSchema.parse(req.body);

  const { token } = req.params;

  const userToken = await prismaClient.userToken.findFirst({
    where: {
      token,
      tokenType: TokenType.RESET_PASSWORD,
      expires_at: { gt: new Date() },
    },
  });

  if (!userToken) {
    throw new HttpException(
      ErrorMessage.VERIFICATION_CODE_INVALID,
      ErrorCode.VERIFICATION_INVALID,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  await prismaClient.user.update({
    where: { id: userToken.user_id },
    data: {
      password: encryptPassword(req.body.new_password),
      user_token: {
        deleteMany: { user_id: userToken.user_id, tokenType: TokenType.RESET_PASSWORD },
      },
    },
  });

  res.json();
};

export const changePassword = async (req: Request, res: Response) => {
  ChangePasswordSchema.parse(req.body);

  const { old_password, new_password } = req.body;
  const user = req.user!;

  if (!isPasswordCorrect(old_password, user.password)) {
    throw new HttpException(
      ErrorMessage.INCORRECT_PASSWORD,
      ErrorCode.INCORRECT_PASSWORD,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  await prismaClient.user.update({
    where: { id: user.id },
    data: { password: encryptPassword(new_password) },
  });

  res.json();
};

export const me = async (req: Request, res: Response) => {
  res.json(req.user);
};

export const deleteMe = async (req: Request, res: Response) => {
  const user_id = req.user!.id;

  await prismaClient.$transaction(async () => {
    await Promise.all([
      await prismaClient.user.update({
        where: { id: user_id },
        data: {
          email: chance.email({ domain: '@deleted.com' }),
          password: encryptPassword(chance.string()),
          name: 'Deleted User',
          is_verified: false,
        },
      }),
      await prismaClient.organisation.deleteMany({
        where: {
          organisation_user: { some: { user_id: req.user!.id, user_role: UserRole.OWNER } },
        },
      }),
    ]);

    return true;
  });

  res.json();
};
