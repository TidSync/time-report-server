import { UserRole } from '@prisma/client';

const ALL_VISIBLE = [UserRole.OWNER, UserRole.ADMIN] as UserRole[];
const ALL_UNDER_PROJECT_VISIBLE = [...ALL_VISIBLE, UserRole.PROJECT_MANAGER] as UserRole[];

export const canSeeAllEntities = (userRole: UserRole) => ALL_VISIBLE.includes(userRole);
export const canSeeAllUnderProjectEntities = (userRole: UserRole) =>
  ALL_UNDER_PROJECT_VISIBLE.includes(userRole);
