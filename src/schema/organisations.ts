import { z } from 'zod';

export const OrganisationSchema = z.object({
  name: z.string(),
});
