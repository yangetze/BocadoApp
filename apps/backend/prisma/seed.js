import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main () {
  const hashedPassword = await bcrypt.hash('b0cad0', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bocadoapp.com' },
    update: {},
    create: {
      email: 'admin@bocadoapp.com',
      username: 'admin',
      identificationNumber: '1234',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      active: true
    }
  })

  console.log('Admin user seeded:', admin.username)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
