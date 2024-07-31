import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import organisationRoutes from './organisations';
import projectRoutes from './projects';
import timesheetRoutes from './timesheets';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/users', usersRoutes);
rootRouter.use('/organisations', organisationRoutes);
rootRouter.use('/projects', projectRoutes);
rootRouter.use('/timesheets', timesheetRoutes);

export default rootRouter;
