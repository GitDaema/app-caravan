import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

export const devRouter = Router();

// Development/demo overview endpoint used by the Dashboard's DemoOverview widget.
// Returns a lightweight snapshot of caravans and reservations so the
// frontend can render a simple overview without failing with 404.
devRouter.get('/overview', requireAuth, async (_req, res, next) => {
  try {
    const caravans = await prisma.caravan.findMany({
      orderBy: { id: 'asc' },
      take: 20,
    });

    const reservations = await prisma.reservation.findMany({
      orderBy: { start_date: 'desc' },
      take: 20,
    });

    res.json({
      caravans: caravans.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
      })),
      reservations: reservations.map((r) => ({
        id: r.id,
        caravan_id: r.caravan_id,
        start_date: r.start_date,
        end_date: r.end_date,
        status: r.status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

