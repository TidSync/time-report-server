import {
  changePassword,
  deleteMe,
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
import { authMidd } from 'middlewares/auth';

const authRoutes = Router();
const cb = errorHandler;

authRoutes.post('/signup', cb(signup));
authRoutes.post('/login', cb(login));
authRoutes.post('/send-verification', cb(sendVerification));
authRoutes.get('/verify-user/:token', cb(verifyUser));
authRoutes.post('/reset-password', cb(resetPassword));
authRoutes.post('/verify-reset-password/:token', cb(verifyResetPassword));
authRoutes.post('/change-password', [authMidd], cb(changePassword));
authRoutes.get('/me', [authMidd], cb(me));
authRoutes.delete('/me', [authMidd], cb(deleteMe));

export default authRoutes;
