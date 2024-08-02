import { z } from 'zod';

export const UpdateTimesheetsSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  timesheets: z.array(
    z
      .object({
        id: z.string().uuid().optional(),
        target_date: z.string().datetime(),
        hours: z.number().int().optional(),
        minutes: z.number().int().optional(),
        description: z.string().optional(),
        link: z.string().url(),
      })
      .transform((data, ctx) => {
        if (!data.hours && !data.minutes) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Either minutes or hours must not be empty',
          });

          return z.NEVER;
        }

        return data;
      }),
  ),
});

export const DeleteTimesheetsSchema = z.object({
  project_id: z.string().uuid(),
  timesheets: z.array(z.string().uuid()),
});

export const GetTimesheetsSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
});
