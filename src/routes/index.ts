import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import organisationRoutes from './organisations';
import projectRoutes from './projects';
import timesheetRoutes from './timesheets';
import { authMidd } from 'middlewares/auth';
import teamsRoutes from './teams';
import { isOrgUser } from 'middlewares/organisations';
import { isProjectUser } from 'middlewares/projects';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/users', usersRoutes);
rootRouter.use('/organisations', [authMidd], organisationRoutes);
rootRouter.use('/projects', [authMidd], projectRoutes);
rootRouter.use('/timesheets', [authMidd, isOrgUser, isProjectUser], timesheetRoutes);
rootRouter.use('/teams', [authMidd], teamsRoutes);

export default rootRouter;
