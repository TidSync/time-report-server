import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import organisationRoutes from './organisations';
import projectRoutes from './projects';
import timesheetRoutes from './timesheets';
import { authMidd } from 'middlewares/auth';
import teamRoutes from './teams';
import activityRoutes from './activities';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/users', usersRoutes);
rootRouter.use('/organisations', [authMidd], organisationRoutes);
rootRouter.use('/projects', [authMidd], projectRoutes);
rootRouter.use('/timesheets', [authMidd], timesheetRoutes);
rootRouter.use('/teams', [authMidd], teamRoutes);
rootRouter.use('/activities', [authMidd], activityRoutes);

export default rootRouter;
