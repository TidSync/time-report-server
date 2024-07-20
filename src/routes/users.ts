import { assignUserToRole, updateUser } from 'controllers/users';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';

const usersRoutes: Router = Router();

usersRoutes.put('/', [authMiddleware], errorHandler(updateUser));
usersRoutes.post('/assign-organisation-role', [authMiddleware], errorHandler(assignUserToRole));

export default usersRoutes;
