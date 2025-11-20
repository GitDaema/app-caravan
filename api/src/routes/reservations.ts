import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

export const reservationsRouter = Router();

reservationsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user;
    const reservations = await prisma.reservation.findMany({
      where: { user_id: user.id },
      include: { caravan: true },
    });
    res.json(
      reservations.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        caravan_id: r.caravan_id,
        start_date: r.start_date,
        end_date: r.end_date,
        price: r.price,
        status: r.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

reservationsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user;
    const { caravan_id, start_date, end_date } = req.body as {
      caravan_id: number;
      start_date: string;
      end_date: string;
    };

    const caravan = await prisma.caravan.findUnique({ where: { id: caravan_id } });
    if (!caravan) {
      return res.status(404).json({ message: 'Caravan not found' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const diffMs = end.getTime() - start.getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round(diffMs / msPerDay);

    if (nights <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const totalPrice = caravan.price_per_day * nights;
    const hostId = caravan.host_id;

    const reservation = await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({ where: { id: user.id } });
      if (!currentUser) {
        throw new Error('USER_NOT_FOUND');
      }

      if (currentUser.balance < totalPrice) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalPrice } },
      });

      if (hostId && hostId !== user.id) {
        await tx.user.update({
          where: { id: hostId },
          data: { balance: { increment: totalPrice } },
        });
      }

      return tx.reservation.create({
        data: {
          user_id: user.id,
          caravan_id,
          start_date: start,
          end_date: end,
          price: totalPrice,
        },
      });
    });

    res.status(201).json({
      id: reservation.id,
      user_id: reservation.user_id,
      caravan_id: reservation.caravan_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      price: reservation.price,
      status: reservation.status,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_BALANCE') {
      return res
        .status(400)
        .json({ message: '잔액이 부족합니다. 잔액을 충전한 뒤 다시 시도해주세요.' });
    }
    next(err);
  }
});

reservationsRouter.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'cancelled' },
    });
    res.json({
      id: reservation.id,
      user_id: reservation.user_id,
      caravan_id: reservation.caravan_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      price: reservation.price,
      status: reservation.status,
    });
  } catch (err) {
    next(err);
  }
});

reservationsRouter.get('/host', requireAuth, requireRole('HOST'), async (req, res, next) => {
  try {
    const user: any = req.user;
    const reservations = await prisma.reservation.findMany({
      where: { caravan: { host_id: user.id } },
      include: { caravan: true, user: true },
    });
    res.json(
      reservations.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        caravan_id: r.caravan_id,
        start_date: r.start_date,
        end_date: r.end_date,
        price: r.price,
        status: r.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

reservationsRouter.get('/admin/all', requireAuth, requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { caravan: true, user: true },
    });
    res.json(
      reservations.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        caravan_id: r.caravan_id,
        start_date: r.start_date,
        end_date: r.end_date,
        price: r.price,
        status: r.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

reservationsRouter.post('/:id/status', requireAuth, requireRole('HOST'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status: 'pending' | 'confirmed' | 'cancelled' };
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
    });
    res.json({
      id: reservation.id,
      user_id: reservation.user_id,
      caravan_id: reservation.caravan_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      price: reservation.price,
      status: reservation.status,
    });
  } catch (err) {
    next(err);
  }
});
