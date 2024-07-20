import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const APP_PORT = process.env.APP_PORT!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const EMAIL = process.env.EMAIL!;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;
