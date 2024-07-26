import { z } from 'zod';

export const SkipSchema = z.object({
  cursor: z.string().optional(),
});
