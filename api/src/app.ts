import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env';
import { configureSession } from './config/session';
import { configurePassport } from './config/passport';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { caravansRouter } from './routes/caravans';
import { reservationsRouter } from './routes/reservations';
import { devRouter } from './routes/dev';

export function createApp() {
  const app = express();

  // Behind Nginx/HTTPS we trust the proxy to report the original protocol.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(morgan(env.nodeEnv === 'test' ? 'tiny' : 'dev'));
  app.use(express.json());
  app.use(cookieParser());

  configureSession(app);
  configurePassport();

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/dev', devRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/caravans', caravansRouter);
  app.use('/api/reservations', reservationsRouter);

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    },
  );

  return app;
}
