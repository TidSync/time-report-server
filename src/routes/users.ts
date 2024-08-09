import { updateUser, uploadUserPhoto } from 'controllers/users';
import { errorHandler as cb } from 'error-handler';
import { Router } from 'express';
import { authMidd } from 'middlewares/auth';
import { uploadFile } from 'middlewares/uploadFile';

const userRoutes: Router = Router();

userRoutes.put('/', [authMidd], cb(updateUser));
userRoutes.put('/upload', [authMidd, uploadFile], cb(uploadUserPhoto));

export default userRoutes;
