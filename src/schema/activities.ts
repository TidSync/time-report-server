import { z } from 'zod';

export const CreateActivitySchema = z.object({
  organisation_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
});

export const UpdateActivitySchema = z.object({
  organisation_id: z.string().uuid(),
  activity_id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const RemoveActivitySchema = z.object({
  organisation_id: z.string().uuid(),
  activity_id: z.string().uuid(),
});

export const GetActivitySchema = z.object({
  organisation_id: z.string().uuid(),
});
