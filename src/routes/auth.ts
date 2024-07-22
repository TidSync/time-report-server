import {
  changePassword,
  login,
  me,
  resetPassword,
  sendVerification,
  signup,
  verifyResetPassword,
  verifyUser,
} from 'controllers/auth';
import { errorHandler } from 'error-handler';
import { Router } from 'express';
import { authMiddleware } from 'middlewares/auth';

const authRoutes = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));
authRoutes.post('/send-verification', errorHandler(sendVerification));
authRoutes.get('/verify-user/:token', errorHandler(verifyUser));
authRoutes.post('/reset-password', errorHandler(resetPassword));
authRoutes.post('/verify-reset-password/:token', errorHandler(verifyResetPassword));
authRoutes.post('/change-password', [authMiddleware], errorHandler(changePassword));
authRoutes.get('/me', [authMiddleware], errorHandler(me));

export default authRoutes;
