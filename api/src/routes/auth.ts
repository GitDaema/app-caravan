import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';

export const authRouter = Router();

function serializeUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: (user.role ?? 'guest').toString().toUpperCase(),
    balance: user.balance ?? 0,
  };
}

authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info?.message ?? 'Invalid credentials' });
    req.logIn(user, (loginErr: any) => {
      if (loginErr) return next(loginErr);
      return res.json({ user: serializeUser(user) });
    });
  })(req, res, next);
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body as { email: string; password: string; fullName?: string };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        fullName: fullName ?? '',
        role: 'guest',
      },
    });
    req.logIn(user, (err: any) => {
      if (err) return next(err);
      return res.status(201).json({ user: serializeUser(user) });
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res, next) => {
  req.logout((err: any) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('caravanshare.sid');
      res.json({ ok: true });
    });
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback', (req, res, next) => {
  if (req.query.error) {
    return res.redirect(`${env.frontendBaseUrl}/login?error=google_cancelled`);
  }

  passport.authenticate('google', (err: any, user: any, info: any) => {
    if (err) {
      return res.redirect(`${env.frontendBaseUrl}/login?error=google_server`);
    }
    if (!user) {
      const code = info?.message === 'No email from Google' ? 'google_no_email' : 'google';
      return res.redirect(`${env.frontendBaseUrl}/login?error=${code}`);
    }
    req.logIn(user, (loginErr: any) => {
      if (loginErr) {
        return res.redirect(`${env.frontendBaseUrl}/login?error=google_login`);
      }
      return res.redirect(`${env.frontendBaseUrl}/app`);
    });
  })(req, res, next);
});

authRouter.get('/naver', passport.authenticate('naver', { scope: ['profile'] }));

authRouter.get('/naver/callback', (req, res, next) => {
  if (req.query.error) {
    return res.redirect(`${env.frontendBaseUrl}/login?error=naver_cancelled`);
  }

  passport.authenticate('naver', (err: any, user: any, info: any) => {
    if (err) {
      return res.redirect(`${env.frontendBaseUrl}/login?error=naver_server`);
    }
    if (!user) {
      const code = info?.message === 'No email from Naver' ? 'naver_no_email' : 'naver';
      return res.redirect(`${env.frontendBaseUrl}/login?error=${code}`);
    }
    req.logIn(user, (loginErr: any) => {
      if (loginErr) {
        return res.redirect(`${env.frontendBaseUrl}/login?error=naver_login`);
      }
      return res.redirect(`${env.frontendBaseUrl}/app`);
    });
  })(req, res, next);
});

authRouter.get('/kakao', passport.authenticate('kakao'));

authRouter.get('/kakao/callback', (req, res, next) => {
  if (req.query.error) {
    return res.redirect(`${env.frontendBaseUrl}/login?error=kakao_cancelled`);
  }

  passport.authenticate('kakao', (err: any, user: any) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('[Kakao auth error]', err);
      return res.redirect(`${env.frontendBaseUrl}/login?error=kakao_server`);
    }
    if (!user) {
      return res.redirect(`${env.frontendBaseUrl}/login?error=kakao`);
    }
    req.logIn(user, (loginErr: any) => {
      if (loginErr) {
        return res.redirect(`${env.frontendBaseUrl}/login?error=kakao_login`);
      }
      return res.redirect(`${env.frontendBaseUrl}/app`);
    });
  })(req, res, next);
});
