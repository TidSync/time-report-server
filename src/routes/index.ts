import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import organisationRoutes from './organisations';
import projectRoutes from './projects';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/users', usersRoutes);
rootRouter.use('/organisations', organisationRoutes);
rootRouter.use('/projects', projectRoutes);

export default rootRouter;
