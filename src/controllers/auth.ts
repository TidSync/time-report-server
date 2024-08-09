import { Request, Response } from 'express';
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
import { TokenType } from '@prisma/client';
import { encryptPassword, isPasswordCorrect } from 'utils/password';
import { userModel, userTokenModel } from 'models';
import { sendResponse } from 'response-hook';
import { APP_URL } from 'secrets';

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = SignupSchema.parse(req.body);

  let user = await userModel.getUserByEmail(email);

  if (user) {
    throw new HttpException(
      ErrorMessage.USER_ALREADY_EXISTS,
      ErrorCode.USER_ALREADY_EXISTS,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  user = await userModel.createUser(email, name, password, APP_URL);

  const sessionToken = createSessionToken({ userId: user.id });

  sendResponse(res, { user, token: sessionToken });
};

export const sendVerification = async (req: Request, res: Response) => {
  BaseUserSchema.parse(req.body);

  const { email } = req.body;

  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new HttpException(
      ErrorMessage.USER_NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  if (user.is_verified) {
    throw new HttpException(
      ErrorMessage.USER_ALREADY_VERIFIED,
      ErrorCode.USER_ALREADY_VERIFIED,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  const token = createValidationToken();

  await Promise.all([
    await userTokenModel.createUserToken(user.id, token, TokenType.VERIFY_EMAIL),
    await sendVerificationEmail(user.email, user.name, token, APP_URL),
  ]);

  sendResponse(res);
};

export const verifyUser = async (req: Request, res: Response) => {
  UserTokenSchema.parse(req.params);

  const { token } = req.params;

  const userToken = await userTokenModel.getUserToken(token, TokenType.VERIFY_EMAIL);

  if (!userToken) {
    throw new HttpException(
      ErrorMessage.VERIFICATION_CODE_INVALID,
      ErrorCode.VERIFICATION_INVALID,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  await userModel.updateUser(userToken.user_id, {
    is_verified: true,
    user_token: { deleteMany: { user_id: userToken.user_id, token_type: TokenType.VERIFY_EMAIL } },
  });

  sendResponse(res);
};

export const login = async (req: Request, res: Response) => {
  LoginSchema.parse(req.body);

  const { email, password } = req.body;
  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new HttpException(
      ErrorMessage.USER_NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  if (!isPasswordCorrect(password, user.password)) {
    throw new HttpException(
      ErrorMessage.INCORRECT_PASSWORD,
      ErrorCode.INCORRECT_PASSWORD,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  const token = createSessionToken({ userId: user.id });

  sendResponse(res, { user, token });
};

export const resetPassword = async (req: Request, res: Response) => {
  BaseUserSchema.parse(req.body);

  const { email } = req.body;
  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new HttpException(
      ErrorMessage.USER_NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      StatusCode.NOT_FOUND,
      null,
    );
  }

  const token = createValidationToken();

  await Promise.all([
    await userTokenModel.createUserToken(user.id, token, TokenType.RESET_PASSWORD),
    await sendResetPasswordEmail(user.email, user.name, token, APP_URL),
  ]);

  sendResponse(res);
};

export const verifyResetPassword = async (req: Request, res: Response) => {
  UserTokenSchema.parse(req.params);
  ResetPasswordSchema.parse(req.body);

  const { token } = req.params;

  const userToken = await userTokenModel.getUserToken(token, TokenType.RESET_PASSWORD);

  if (!userToken) {
    throw new HttpException(
      ErrorMessage.VERIFICATION_CODE_INVALID,
      ErrorCode.VERIFICATION_INVALID,
      StatusCode.BAD_REQUEST,
      null,
    );
  }

  await userModel.updateUser(userToken.user_id, {
    password: encryptPassword(req.body.new_password),
    user_token: {
      deleteMany: { user_id: userToken.user_id, token_type: TokenType.RESET_PASSWORD },
    },
  });

  sendResponse(res);
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

  await userModel.updateUser(user.id, { password: encryptPassword(new_password) });

  sendResponse(res);
};

export const me = async (req: Request, res: Response) => {
  sendResponse(res, req.user);
};

export const deleteMe = async (req: Request, res: Response) => {
  await userModel.deleteUser(req.user!.id);

  sendResponse(res);
};
