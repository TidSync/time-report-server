import { COLORS_REGEX } from 'constants/colors';
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  organisation_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  color: z.string().regex(COLORS_REGEX),
});

export const GetProjectSchema = z.object({
  project_id: z.string().uuid(),
});

export const DeleteProjectSchema = z.object({
  project_id: z.string().uuid(),
});

export const UpdateProjectSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(COLORS_REGEX).optional(),
});

export const GetProjectUsersSchema = z.object({
  project_id: z.string().uuid(),
});

export const AddUserToProjectSchema = z.object({
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

export const RemoveProjectUserSchema = z.object({
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

export const ListProjectsSchema = z.object({
  organisation_id: z.string().uuid(),
});

export const CreateProjectCategorySchema = z.object({
  project_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
});

export const UpdateProjectCategorySchema = z.object({
  project_category_id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const RemoveProjectCategorySchema = z.object({
  project_category_id: z.string().uuid(),
});

export const GetProjectCategorySchema = z.object({
  project_id: z.string().uuid(),
});
