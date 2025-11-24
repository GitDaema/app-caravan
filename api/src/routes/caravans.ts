import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

export const caravansRouter = Router();

caravansRouter.get('/', async (_req, res, next) => {
  try {
    const caravans = await prisma.caravan.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(
      caravans.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        capacity: c.capacity,
        amenities: c.amenities,
        location: c.location,
        imageUrl: c.imageUrl,
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
        imageUrl: req.body.imageUrl,
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
      imageUrl: caravan.imageUrl,
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

caravansRouter.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid caravan id' });
    }

    const user: any = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existing = await prisma.caravan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Caravan not found' });
    }

    const role = typeof user.role === 'string' ? user.role.toUpperCase() : user.role;
    const isAdmin = role === 'ADMIN';
    const isOwner = existing.host_id === user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.caravan.update({
      where: { id },
      data: {
        name: req.body.name ?? existing.name,
        description: req.body.description ?? existing.description,
        imageUrl: req.body.imageUrl ?? existing.imageUrl,
        capacity:
          typeof req.body.capacity === 'number' ? req.body.capacity : existing.capacity,
        amenities: req.body.amenities ?? existing.amenities,
        location: req.body.location ?? existing.location,
        price_per_day:
          typeof req.body.price_per_day === 'number'
            ? req.body.price_per_day
            : existing.price_per_day,
      },
    });

    return res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      capacity: updated.capacity,
      amenities: updated.amenities,
      location: updated.location,
      price_per_day: updated.price_per_day,
      status: updated.status,
      host_id: updated.host_id,
    });
  } catch (err) {
    next(err);
  }
});

caravansRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid caravan id' });
    }

    const user: any = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existing = await prisma.caravan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Caravan not found' });
    }

    const role = typeof user.role === 'string' ? user.role.toUpperCase() : user.role;
    const isAdmin = role === 'ADMIN';
    const isOwner = existing.host_id === user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.caravan.update({
      where: { id },
      data: { status: 'maintenance' },
    });

    return res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      capacity: updated.capacity,
      amenities: updated.amenities,
      location: updated.location,
      price_per_day: updated.price_per_day,
      status: updated.status,
      host_id: updated.host_id,
    });
  } catch (err) {
    next(err);
  }
});

caravansRouter.get('/:id/calendar', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid caravan id' });
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        caravan_id: id,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      orderBy: { start_date: 'asc' },
    });

    res.json({
      caravan_id: id,
      ranges: reservations.map((r) => ({
        id: r.id,
        start: r.start_date,
        end: r.end_date,
        status: r.status,
      })),
    });
  } catch (err) {
    next(err);
  }
});
