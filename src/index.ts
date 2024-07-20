import express, { Express } from 'express';
import { APP_PORT } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from 'middlewares/errors';

const app: Express = express();

app.use(express.json());

app.use('/api', rootRouter);
app.use(errorMiddleware);

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
