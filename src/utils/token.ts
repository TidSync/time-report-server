import crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'secrets';

export const createValidationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createSessionToken = (data: Object) => {
  return jwt.sign({ ...data, expires: new Date() }, JWT_SECRET, {
    // 1 month
    expiresIn: 30 * 24 * 3600,
  });
};
