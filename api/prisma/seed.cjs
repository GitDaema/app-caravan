/* Demo seed script for local dev (admin/host/guest users + caravans/reservations) */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcryptjs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client')

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  // 안전장치: 기본적으로 prod/unknown 환경에서는 seed를 막고,
  // 명시적으로 ALLOW_DEMO_SEED=true 인 경우에만 실행되도록 합니다.
  const env = process.env.NODE_ENV || 'development'
  if (env !== 'development' && process.env.ALLOW_DEMO_SEED !== 'true') {
    // eslint-disable-next-line no-console
    console.log(
      `Seed skipped (NODE_ENV=${env}). Set ALLOW_DEMO_SEED=true explicitly if you really want to run demo seed in this environment.`,
    )
    return
  }
  const password = 'password'
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      role: 'admin',
      fullName: 'Admin User',
    },
    create: {
      email: 'admin@example.com',
      fullName: 'Admin User',
      hashedPassword,
      role: 'admin',
      balance: 0,
    },
  })

  const host = await prisma.user.upsert({
    where: { email: 'host@example.com' },
    update: {
      role: 'host',
      fullName: 'Host User',
    },
    create: {
      email: 'host@example.com',
      fullName: 'Host User',
      hashedPassword,
      role: 'host',
      balance: 0,
    },
  })

  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {
      role: 'guest',
      fullName: 'Guest User',
    },
    create: {
      email: 'guest@example.com',
      fullName: 'Guest User',
      hashedPassword,
      role: 'guest',
      balance: 100000,
    },
  })

  const caravan1 = await prisma.caravan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Family Caravan Alpha',
      description: '4인 가족용 기본 카라반',
      capacity: 4,
      amenities: '침대, 주방, 난방',
      location: '부산 해운대 캠핑장',
      price_per_day: 80000,
      status: 'available',
      host_id: host.id,
    },
  })

  const caravan2 = await prisma.caravan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Premium Lakeview Caravan',
      description: '호수 전망 프리미엄 카라반',
      capacity: 6,
      amenities: '더블베드, 에어컨, BBQ 그릴',
      location: '경기도 양평 호수 캠핑장',
      price_per_day: 120000,
      status: 'available',
      host_id: host.id,
    },
  })

  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() + 3)
  const end = new Date(today)
  end.setDate(today.getDate() + 5)

  await prisma.reservation.createMany({
    data: [
      {
        user_id: guest.id,
        caravan_id: caravan1.id,
        start_date: start,
        end_date: end,
        price: caravan1.price_per_day * 2,
        status: 'pending',
      },
      {
        user_id: guest.id,
        caravan_id: caravan2.id,
        start_date: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000),
        price: caravan2.price_per_day * 2,
        status: 'confirmed',
      },
    ],
    skipDuplicates: true,
  })

  // eslint-disable-next-line no-console
  console.log('Seed data created:', {
    admin: admin.email,
    host: host.email,
    guest: guest.email,
  })
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Seed error', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
