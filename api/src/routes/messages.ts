import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

export const messagesRouter = Router();

messagesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const reservationId = Number(req.query.reservation_id);
    if (Number.isNaN(reservationId)) {
      return res.status(400).json({ message: 'reservation_id is required' });
    }
    const user: any = req.user;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { caravan: true },
    });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const hostId = reservation.caravan?.host_id ?? null;
    const isParticipant = reservation.user_id === user.id || hostId === user.id;
    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const messages = await prisma.message.findMany({
      where: { reservation_id: reservationId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(
      messages.map((m) => ({
        id: m.id,
        reservation_id: m.reservation_id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        createdAt: m.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
});

messagesRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user;
    const { reservation_id, content } = req.body as { reservation_id: number; content: string };
    const reservationId = Number(reservation_id);
    const messageContent = (content || '').toString().trim();

    if (Number.isNaN(reservationId)) {
      return res.status(400).json({ message: 'reservation_id is required' });
    }
    if (!messageContent) {
      return res.status(400).json({ message: 'content is required' });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { caravan: true },
    });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const hostId = reservation.caravan?.host_id ?? null;
    const isParticipant = reservation.user_id === user.id || hostId === user.id;
    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const receiverId = user.id === reservation.user_id ? hostId : reservation.user_id;
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver not available' });
    }

    const message = await prisma.message.create({
      data: {
        reservation_id: reservationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: messageContent,
      },
    });

    return res.status(201).json({
      id: message.id,
      reservation_id: message.reservation_id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      createdAt: message.createdAt,
    });
  } catch (err) {
    next(err);
  }
});
