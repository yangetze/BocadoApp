import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is missing.')
  console.error('The application cannot start without a secure JWT secret.')
  console.error('Please set it in your environment variables or .env file.')
  process.exit(1) // Fail-fast
}

export { JWT_SECRET }
