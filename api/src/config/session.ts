import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import type { Express } from 'express';
import { env } from './env';

export function configureSession(app: Express) {
  let store: session.Store;

  if (env.sessionStore === 'memory') {
    store = new session.MemoryStore();
  } else {
    const MySQLStore = MySQLStoreFactory(session);

    // express-mysql-session does not support a generic "uri" option,
    // so parse DATABASE_URL and pass explicit connection params.
    const url = new URL(env.databaseUrl);
    const database = url.pathname.replace(/^\//, '') || 'caravanshare';

    store = new MySQLStore({
      host: url.hostname || 'localhost',
      port: url.port ? Number(url.port) : 3306,
      user: url.username || undefined,
      password: url.password || undefined,
      database,
      createDatabaseTable: true,
    });
  }

  app.use(
    session({
      name: env.sessionCookieName,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'lax' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );
}
