import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const APP_URL = process.env.APP_URL!;
export const APP_PORT = process.env.APP_PORT!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const EMAIL = process.env.EMAIL!;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
