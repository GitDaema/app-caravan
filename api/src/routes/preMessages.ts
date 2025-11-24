import { Router } from 'express'
import { prisma } from '../config/prisma'
import { requireAuth } from '../middleware/auth'

export const preMessagesRouter = Router()

preMessagesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user
    const caravanId = Number(req.query.caravan_id)
    if (Number.isNaN(caravanId)) {
      return res.status(400).json({ message: 'caravan_id is required' })
    }

    const caravan = await prisma.caravan.findUnique({ where: { id: caravanId } })
    if (!caravan) {
      return res.status(404).json({ message: 'Caravan not found' })
    }

    // Only messages where the current user is a participant
    const messages = await prisma.preReservationMessage.findMany({
      where: {
        caravan_id: caravanId,
        OR: [{ sender_id: user.id }, { receiver_id: user.id }],
      },
      orderBy: { createdAt: 'asc' },
    })

    return res.json(
      messages.map((m) => ({
        id: m.id,
        caravan_id: m.caravan_id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        createdAt: m.createdAt,
      })),
    )
  } catch (err) {
    next(err)
  }
})

preMessagesRouter.get('/inbox', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user

    const messages = await prisma.preReservationMessage.findMany({
      where: {
        receiver_id: user.id,
      },
      include: { caravan: true },
      orderBy: { createdAt: 'desc' },
    })

    const byCaravan = new Map<
      number,
      { caravan_id: number; caravan_name: string; lastContent: string; lastAt: Date; count: number }
    >()

    for (const m of messages) {
      const existing = byCaravan.get(m.caravan_id)
      if (!existing) {
        byCaravan.set(m.caravan_id, {
          caravan_id: m.caravan_id,
          caravan_name: m.caravan?.name ?? `Caravan ${m.caravan_id}`,
          lastContent: m.content,
          lastAt: m.createdAt,
          count: 1,
        })
      } else {
        existing.count += 1
      }
    }

    return res.json(Array.from(byCaravan.values()))
  } catch (err) {
    next(err)
  }
})

preMessagesRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const user: any = req.user
    const { caravan_id, content } = req.body as {
      caravan_id: number
      content: string
    }

    const caravanId = Number(caravan_id)
    const messageContent = (content || '').toString().trim()

    if (Number.isNaN(caravanId)) {
      return res.status(400).json({ message: 'caravan_id is required' })
    }
    if (!messageContent) {
      return res.status(400).json({ message: 'content is required' })
    }

    const caravan = await prisma.caravan.findUnique({ where: { id: caravanId } })
    if (!caravan) {
      return res.status(404).json({ message: 'Caravan not found' })
    }

    const hostId = caravan.host_id
    if (!hostId) {
      return res
        .status(400)
        .json({ message: 'This caravan does not have a host and cannot receive inquiries.' })
    }

    let receiverId: number | null = null

    if (user.id === hostId) {
      // Host replying: pick the other participant from the latest message in this thread
      const last = await prisma.preReservationMessage.findFirst({
        where: { caravan_id: caravanId },
        orderBy: { createdAt: 'desc' },
      })
      if (!last) {
        return res.status(400).json({
          message: '게스트 문의가 아직 없습니다. 게스트가 먼저 메시지를 보낸 후에 답장할 수 있습니다.',
        })
      }
      receiverId = last.sender_id !== user.id ? last.sender_id : last.receiver_id
      if (!receiverId || receiverId === user.id) {
        return res.status(400).json({
          message: '답장할 대상 게스트를 찾지 못했습니다.',
        })
      }
    } else {
      // Guest sending: always send to host
      receiverId = hostId
    }

    const message = await prisma.preReservationMessage.create({
      data: {
        caravan_id: caravanId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: messageContent,
      },
    })

    return res.status(201).json({
      id: message.id,
      caravan_id: message.caravan_id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      createdAt: message.createdAt,
    })
  } catch (err) {
    next(err)
  }
})
