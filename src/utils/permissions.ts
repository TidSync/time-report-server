import { UserRole } from '@prisma/client';

const ALL_VISIBLE = [UserRole.OWNER, UserRole.ADMIN] as UserRole[];

export const canSeeAllEntities = (userRole: UserRole) => ALL_VISIBLE.includes(userRole);
