import { updateUser } from 'controllers/users';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMidd } from 'middlewares/auth';

const usersRoutes: Router = Router();
const cb = errorHandler;

usersRoutes.put('/', [authMidd], cb(updateUser));

export default usersRoutes;
