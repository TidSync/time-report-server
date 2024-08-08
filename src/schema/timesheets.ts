import { TimesheetStatus } from '@prisma/client';
import { z } from 'zod';

export const UpdateTimesheetsSchema = z.object({
  project_id: z.string().uuid(),
  timesheets: z.array(
    z
      .object({
        id: z.string().uuid().optional(),
        target_date: z.string().datetime(),
        hours: z.number().int().optional(),
        minutes: z.number().int().optional(),
        description: z.string().optional(),
        project_category_id: z.string().uuid().optional(),
        link: z.string().url().optional(),
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

export const UpdateTimesheetStatusSchema = z.object({
  project_id: z.string().uuid(),
  timesheets: z.array(
    z
      .object({
        id: z.string().uuid(),
        status: z.nativeEnum(TimesheetStatus),
        comment: z.string().optional(),
      })
      .transform((data, ctx) => {
        if (data.status === TimesheetStatus.CHANGE_REQUESTED && !data.comment) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must provide comment if asking for a change',
          });

          return z.NEVER;
        }

        return data;
      }),
  ),
});
