import { UserRole } from '@prisma/client';
import { passwordReg } from 'utils/password';
import { z } from 'zod';
import { getCountryCode } from 'countries-list';

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

export const GetOrganisationUserSchema = z.object({
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
  project_category_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  organisation_address_id: z.string().uuid().optional(),
  timesheet_id: z.string().uuid().optional(),
});

const checkCountry = (data: string, ctx: z.RefinementCtx) => {
  const countryCode = getCountryCode(data);

  if (!countryCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either minutes or hours must not be empty',
    });

    return z.NEVER;
  }

  return countryCode;
};

export const CreateOrganisationAddressSchema = z.object({
  organisation_id: z.string().uuid(),
  is_default: z.boolean(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  country: z.string().transform(checkCountry),
  postal_code: z.string(),
  email: z.string(),
});

export const UpdateOrganisationAddressSchema = z.object({
  organisation_address_id: z.string(),
  is_default: z.boolean().optional(),
  line_one: z.string().optional(),
  line_two: z.string().optional().optional(),
  city: z.string().optional(),
  country: z
    .string()
    .optional()
    .transform((data, ctx) => (data ? checkCountry(data, ctx) : data)),
  postal_code: z.string().optional(),
  email: z.string().optional(),
});

export const DeleteOrganisationAddressSchema = z.object({
  organisation_address_id: z.string(),
});

export const GetOrganisationAddressesSchema = z.object({
  organisation_id: z.string(),
});
