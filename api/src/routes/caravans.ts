import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

export const caravansRouter = Router();

caravansRouter.get('/', async (_req, res, next) => {
  try {
    const caravans = await prisma.caravan.findMany();
    res.json(
      caravans.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        capacity: c.capacity,
        amenities: c.amenities,
        location: c.location,
        price_per_day: c.price_per_day,
        status: c.status,
        host_id: c.host_id,
      })),
    );
  } catch (err) {
    next(err);
  }
});

caravansRouter.post('/', requireAuth, requireRole('HOST'), async (req, res, next) => {
  try {
    const user: any = req.user;
    const caravan = await prisma.caravan.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        capacity: req.body.capacity,
        amenities: req.body.amenities,
        location: req.body.location,
        price_per_day: req.body.price_per_day,
        host_id: user.id,
      },
    });
    res.status(201).json({
      id: caravan.id,
      name: caravan.name,
      description: caravan.description,
      capacity: caravan.capacity,
      amenities: caravan.amenities,
      location: caravan.location,
      price_per_day: caravan.price_per_day,
      status: caravan.status,
      host_id: caravan.host_id,
    });
  } catch (err) {
    next(err);
  }
});
