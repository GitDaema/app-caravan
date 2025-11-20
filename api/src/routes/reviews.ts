import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

export const reviewsRouter = Router();

reviewsRouter.get('/', async (req, res, next) => {
  try {
    const caravanId = Number(req.query.caravan_id);
    if (Number.isNaN(caravanId)) {
      return res.status(400).json({ message: 'caravan_id is required' });
    }

    const reviews = await prisma.review.findMany({
      where: { caravan_id: caravanId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(
      reviews.map((r) => ({
        id: r.id,
        caravan_id: r.caravan_id,
        user_id: r.user_id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
});

reviewsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user;
    const { caravan_id, rating, comment } = req.body as {
      caravan_id: number;
      rating: number;
      comment?: string;
    };

    const caravanId = Number(caravan_id);
    const ratingNumber = Number(rating);

    if (Number.isNaN(caravanId)) {
      return res.status(400).json({ message: 'caravan_id is required' });
    }
    if (Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const caravan = await prisma.caravan.findUnique({ where: { id: caravanId } });
    if (!caravan) {
      return res.status(404).json({ message: 'Caravan not found' });
    }

    const review = await prisma.review.create({
      data: {
        caravan_id: caravanId,
        user_id: user.id,
        rating: ratingNumber,
        comment: (comment || '').toString(),
      },
    });

    return res.status(201).json({
      id: review.id,
      caravan_id: review.caravan_id,
      user_id: review.user_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    next(err);
  }
});
