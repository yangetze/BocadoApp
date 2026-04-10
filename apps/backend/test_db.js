import prisma from './src/prisma.js'

async function main () {
  console.log('--- Probando conexión con Supabase ---')
  try {
    const userCount = await prisma.user.count()
    console.log('✅ CONEXIÓN EXITOSA!')
    console.log(`📡 Hay ${userCount} usuarios en la base de datos.`)
  } catch (error) {
    console.error('❌ ERROR AL CONECTAR:')
    console.error(error.message)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

main()
