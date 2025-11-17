import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';

export const authRouter = Router();

authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info?.message ?? 'Invalid credentials' });
    req.logIn(user, (loginErr: any) => {
      if (loginErr) return next(loginErr);
      return res.json({ user });
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
      return res.status(201).json({ user });
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
  res.json({ user: req.user });
});

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${env.frontendBaseUrl}/login?error=google`,
  }),
  (_req, res) => {
    res.redirect(`${env.frontendBaseUrl}/app`);
  },
);

authRouter.get('/naver', passport.authenticate('naver', { scope: ['profile'] }));

authRouter.get(
  '/naver/callback',
  passport.authenticate('naver', {
    failureRedirect: `${env.frontendBaseUrl}/login?error=naver`,
  }),
  (_req, res) => {
    res.redirect(`${env.frontendBaseUrl}/app`);
  },
);

authRouter.get('/kakao', passport.authenticate('kakao'));

authRouter.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: `${env.frontendBaseUrl}/login?error=kakao`,
  }),
  (_req, res) => {
    res.redirect(`${env.frontendBaseUrl}/app`);
  },
);
