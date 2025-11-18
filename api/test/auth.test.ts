import request from 'supertest'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'

describe('auth routes', () => {
  const email = 'test-login@example.com'
  const password = 'test-password'

  beforeAll(async () => {
    process.env.SESSION_STORE = 'memory'

    await prisma.socialAccount.deleteMany({
      where: { user: { email } },
    })
    await prisma.user.deleteMany({ where: { email } })

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
        fullName: 'Test User',
        role: 'guest',
        balance: 0,
      },
    })
  })

  afterAll(async () => {
    await prisma.socialAccount.deleteMany({
      where: { user: { email } },
    })
    await prisma.user.deleteMany({ where: { email } })
  })

  it('logs in with local credentials and returns /auth/me', async () => {
    const app = createApp()
    const agent = request.agent(app)

    const loginRes = await agent
      .post('/auth/login')
      .send({ email, password })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.user).toMatchObject({
      email,
      role: 'GUEST',
    })

    const meRes = await agent.get('/auth/me')
    expect(meRes.status).toBe(200)
    expect(meRes.body.user).toMatchObject({
      email,
      role: 'GUEST',
    })
  })

  it('handles google callback success via custom passport authenticate', async () => {
    const app = createApp()
    const agent = request.agent(app)

    const originalAuthenticate = passport.authenticate

    ;(passport as any).authenticate = (strategy: string, cb: any) => {
      if (strategy !== 'google') {
        return (originalAuthenticate as any)(strategy, cb)
      }
      return (req: any, res: any, _next: any) => {
        const fakeUser = {
          id: 9999,
          email: 'google-user@example.com',
          fullName: 'Google User',
          role: 'guest',
          balance: 0,
        }
        cb(null, fakeUser, {})
      }
    }

    const res = await agent.get('/auth/google/callback')

    ;(passport as any).authenticate = originalAuthenticate

    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('/app')
  })
})

