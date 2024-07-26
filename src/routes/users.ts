import { updateUser } from 'controllers/users';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';

const usersRoutes: Router = Router();

usersRoutes.put('/', [authMiddleware], errorHandler(updateUser));

export default usersRoutes;
