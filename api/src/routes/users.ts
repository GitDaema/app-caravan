import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

usersRouter.put('/me/balance', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user;
    const { amount } = req.body as { amount: number };
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { balance: user.balance + amount },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
