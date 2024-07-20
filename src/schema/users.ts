import { z } from 'zod';

export const BaseUserSchema = z.object({ email: z.string().email() });

export const LoginSchema = BaseUserSchema.extend({
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
});

export const SignupSchema = LoginSchema.extend({
  name: z.string(),
});

export const UserTokenSchema = z.object({
  token: z.string().length(64),
});

export const ResetPasswordSchema = z.object({
  old_password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  new_password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
});

export const ChangePasswordSchema = BaseUserSchema.and(ResetPasswordSchema);

export const AddressSchema = z.object({
  line_one: z.string(),
  line_two: z.string().nullable(),
  postal_code: z.string().length(6),
  country: z.string(),
  city: z.string(),
});

export const UpdateAddressSchema = z.object({
  id: z.string(),
  line_one: z.string().optional(),
  line_two: z.string().nullable().optional(),
  postal_code: z.string().length(6).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().nullable().optional(),
});

export const AssignUserToOrganisationRole = z.object({
  role_id: z.string().uuid(),
  organisation_id: z.string().uuid(),
  user_id: z.string().uuid(),
});
