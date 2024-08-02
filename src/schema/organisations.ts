import { UserRole } from '@prisma/client';
import { passwordReg } from 'utils/password';
import { z } from 'zod';

export const CreateOrganisationSchema = z.object({
  name: z.string(),
});

export const GetOrganisationSchema = z.object({
  organisation_id: z.string().uuid(),
});

export const UpdateOrganisationSchema = GetOrganisationSchema.extend({
  name: z.string().optional(),
});

export const RemoveOrganisationSchema = z.object({
  organisation_id: z.string().uuid(),
});

export const InviteUserToOrganisationSchema = z.object({
  organisation_id: z.string().uuid(),
  user_email: z.string().email(),
});

export const RemoveOrganisationUserSchema = z.object({
  organisation_id: z.string().uuid(),
  user_id: z.string().uuid(),
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

export const FindOrganisationSchema = z.object({
  organisation_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
});
