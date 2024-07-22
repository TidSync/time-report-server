import { UserRole } from '@prisma/client';
import { passwordReg } from 'utils/password';
import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().nullable().optional(),
});

export const InviteUserToOrganisationSchema = z.object({
  organisation_id: z.string().uuid(),
  user_email: z.string().email(),
});

export const confirmOrganisationInvitationSchema = z.object({
  email: z.string().uuid().optional(),
  name: z.string().optional(),
  password: z.string().regex(passwordReg).optional(),
  organisation_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const AssignUserToOrganisationRole = z.object({
  organisation_id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_role: z.nativeEnum(UserRole),
});
