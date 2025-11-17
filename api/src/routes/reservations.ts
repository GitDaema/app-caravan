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
    const { caravan_id, start_date, end_date, price } = req.body as {
      caravan_id: number;
      start_date: string;
      end_date: string;
      price?: number;
    };

    const caravan = await prisma.caravan.findUnique({ where: { id: caravan_id } });
    if (!caravan) {
      return res.status(404).json({ message: 'Caravan not found' });
    }

    const reservation = await prisma.reservation.create({
      data: {
        user_id: user.id,
        caravan_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        price: price ?? caravan.price_per_day,
      },
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
