import { Router } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

export const reservationsRouter = Router();

// 내 예약 목록
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
        caravan_name: r.caravan?.name ?? null,
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

// 예약 생성 (중복 날짜 차단 + 잔액 검증)
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

      // [start, end) 구간 겹치는 예약(취소되지 않은 것만) 차단
      const overlapping = await tx.reservation.findFirst({
        where: {
          caravan_id,
          status: { in: ['pending', 'confirmed'] },
          start_date: { lt: end },
          end_date: { gt: start },
        },
      });
      if (overlapping) {
        throw new Error('DUPLICATE_RESERVATION');
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
      return res.status(400).json({
        message: '잔액이 부족합니다. 잔액을 충전한 뒤 다시 시도해 주세요.',
      });
    }
    if (err instanceof Error && err.message === 'DUPLICATE_RESERVATION') {
      return res.status(400).json({
        message: '선택한 기간에는 이미 예약이 있습니다. 다른 날짜를 선택해 주세요.',
      });
    }
    next(err);
  }
});

// 게스트 예약 취소 (본인만 가능)
reservationsRouter.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user;
    const id = Number(req.params.id);

    const reservation = await prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findUnique({
        where: { id },
        include: { caravan: true },
      });

      if (!existing) {
        throw new Error('RESERVATION_NOT_FOUND');
      }

      if (existing.user_id !== user.id) {
        throw new Error('FORBIDDEN');
      }

      if (existing.status !== 'cancelled') {
        const guestId = existing.user_id;
        const hostId = existing.caravan?.host_id ?? null;
        const amount = existing.price;

        if (amount > 0) {
          await tx.user.update({
            where: { id: guestId },
            data: { balance: { increment: amount } },
          });

          if (hostId && hostId !== guestId) {
            await tx.user.update({
              where: { id: hostId },
              data: { balance: { decrement: amount } },
            });
          }
        }
      }

      return tx.reservation.update({
        where: { id },
        data: { status: 'cancelled' },
      });
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
    if (err instanceof Error && err.message === 'RESERVATION_NOT_FOUND') {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next(err);
  }
});

// 호스트용 예약 목록
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
        caravan_name: r.caravan?.name ?? null,
        guest_name: r.user?.fullName || r.user?.email || null,
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

// 관리자용 전체 예약 목록
reservationsRouter.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN'),
  async (_req, res, next) => {
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
          caravan_name: r.caravan?.name ?? null,
          guest_name: r.user?.fullName || r.user?.email || null,
        })),
      );
    } catch (err) {
      next(err);
    }
  },
);

// 취소 예약 정리 (보조 유틸)
reservationsRouter.post('/cleanup-cancelled', requireAuth, async (_req, res, next) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.reservation.findMany({
        where: { status: 'cancelled' },
        select: { id: true },
      });

      if (cancelled.length === 0) {
        return { deletedCount: 0 };
      }

      const ids = cancelled.map((r) => r.id);

      await tx.message.deleteMany({
        where: { reservation_id: { in: ids } },
      });

      const deleteResult = await tx.reservation.deleteMany({
        where: { id: { in: ids } },
      });

      return { deletedCount: deleteResult.count };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 호스트 예약 상태 변경 (엄격한 상태 전이 + 권한 체크)
reservationsRouter.post(
  '/:id/status',
  requireAuth,
  requireRole('HOST'),
  async (req, res, next) => {
    try {
      const user: any = req.user;
      const id = Number(req.params.id);
      const { status } = req.body as { status: 'pending' | 'confirmed' | 'cancelled' };

      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const reservation = await prisma.$transaction(async (tx) => {
        const existing = await tx.reservation.findUnique({
          where: { id },
          include: { caravan: true },
        });

        if (!existing) {
          throw new Error('RESERVATION_NOT_FOUND');
        }

        if (!existing.caravan || existing.caravan.host_id !== user.id) {
          throw new Error('FORBIDDEN');
        }

        const currentStatus = existing.status;
        const nextStatus = status;

        if (currentStatus === nextStatus) {
          return existing;
        }

        if (currentStatus === 'cancelled' && nextStatus !== 'cancelled') {
          throw new Error('CANNOT_UPDATE_CANCELLED');
        }

        const isValidTransition =
          (currentStatus === 'pending' &&
            (nextStatus === 'confirmed' || nextStatus === 'cancelled')) ||
          (currentStatus === 'confirmed' && nextStatus === 'cancelled');

        if (!isValidTransition) {
          throw new Error('INVALID_TRANSITION');
        }

        if (nextStatus === 'cancelled' && currentStatus !== 'cancelled') {
          const guestId = existing.user_id;
          const hostId = existing.caravan?.host_id ?? null;
          const amount = existing.price;

          if (amount > 0) {
            await tx.user.update({
              where: { id: guestId },
              data: { balance: { increment: amount } },
            });

            if (hostId && hostId !== guestId) {
              await tx.user.update({
                where: { id: hostId },
                data: { balance: { decrement: amount } },
              });
            }
          }
        }

        return tx.reservation.update({
          where: { id },
          data: { status: nextStatus },
        });
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
      if (err instanceof Error && err.message === 'RESERVATION_NOT_FOUND') {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      if (err instanceof Error && err.message === 'FORBIDDEN') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (err instanceof Error && err.message === 'CANNOT_UPDATE_CANCELLED') {
        return res
          .status(400)
          .json({ message: '이미 취소된 예약은 상태를 변경할 수 없습니다.' });
      }
      if (err instanceof Error && err.message === 'INVALID_TRANSITION') {
        return res
          .status(400)
          .json({ message: '허용되지 않는 예약 상태 변경입니다.' });
      }
      next(err);
    }
  },
);

