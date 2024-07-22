import { z } from 'zod';

export const CreateOrganisationSchema = z.object({
  name: z.string(),
});

export const GetOrganisationSchema = z.object({
  organisation_id: z.string().uuid(),
});

export const UpdateOrganisationSchema = GetOrganisationSchema.extend({
  name: z.string(),
});

export const IsUserOrganisationAdminSchema = z.object({
  id: z.string().uuid(),
});
