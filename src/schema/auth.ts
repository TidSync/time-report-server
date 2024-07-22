import { passwordReg } from 'utils/password';
import { z } from 'zod';

export const BaseUserSchema = z.object({ email: z.string().email() });

export const LoginSchema = BaseUserSchema.extend({
  password: z.string().regex(passwordReg),
});

export const SignupSchema = LoginSchema.extend({
  name: z.string(),
  organisation_id: z.string().uuid().optional(),
});

export const UserTokenSchema = z.object({
  token: z.string().length(64),
});

export const ResetPasswordSchema = z.object({
  old_password: z.string().regex(passwordReg),
  new_password: z.string().regex(passwordReg),
});

export const ChangePasswordSchema = BaseUserSchema.and(ResetPasswordSchema);
