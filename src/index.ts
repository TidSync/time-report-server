import express, { Express } from 'express';
import { APP_PORT, STRIPE_SECRET_KEY } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from 'middlewares/errors';
import Stripe from 'stripe';
import { listenPaymentEvents } from 'controllers/OrganisationBillings';
import { errorHandler as cb } from 'error-handler';

const app: Express = express();

app.use('/files', express.static('files'));
app.post('/listen/payments', express.raw({ type: 'application/json' }), cb(listenPaymentEvents));
app.use(express.json());

app.use('/api', rootRouter);
app.use(errorMiddleware);

export const stripe = new Stripe(STRIPE_SECRET_KEY);
export const prismaClient = new PrismaClient({
  log: ['query'],
});
// TODO: Learn what exactly extends does!
// .$extends({
//   query: {
//     user: {
//       create({ args, query }) {
//         args.data = SignupSchema.parse(args.data);

//         return query(args);
//       },
//     },
//   },
// });

app.listen(APP_PORT, () => {
  // Comment here
  console.log(`now listening on port ${APP_PORT}`);
});
