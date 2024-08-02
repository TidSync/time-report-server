import { COLORS_REGEX } from 'constants/colors';
import { z } from 'zod';

export const CreateTeamSchema = z.object({
  name: z.string(),
  color: z.string().regex(COLORS_REGEX),
  organisation_id: z.string().uuid(),
});
export const GetTeamSchema = z.object({ team_id: z.string().uuid() });
export const DeleteTeamSchema = z.object({ team_id: z.string().uuid() });
export const ListTeamsSchema = z.object({ organisation_id: z.string().uuid() });
export const UpdateTeamSchema = z.object({
  team_id: z.string().uuid(),
  name: z.string().optional(),
  color: z.string().regex(COLORS_REGEX).optional(),
});

export const AddTeamUserSchema = z.object({
  user_id: z.string().uuid(),
  team_id: z.string().uuid(),
});
export const RemoveTeamUserSchema = z.object({
  user_id: z.string().uuid(),
  team_id: z.string().uuid(),
});
