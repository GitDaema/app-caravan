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

    if (user.id === hostId) {
      return res.status(403).json({
        message: 'Hosts cannot start pre-reservation messages as guests. Use reservation messages instead.',
      })
    }

    const message = await prisma.preReservationMessage.create({
      data: {
        caravan_id: caravanId,
        sender_id: user.id,
        receiver_id: hostId,
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

