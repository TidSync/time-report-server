import { updateUser } from 'controllers/users';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { authMidd } from 'middlewares/auth';

const userRoutes: Router = Router();

userRoutes.put('/', [authMidd], cb(updateUser));

export default userRoutes;
