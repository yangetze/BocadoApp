import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'test') {
  const { jest } = await import('@jest/globals');
  
  prisma = {
    currency: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    exchangeRate: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    superRecipe: {
      findUnique: jest.fn(),
    },
    budget: {
      create: jest.fn(),
      findMany: jest.fn(),
    }
  };
} else {
  prisma = new PrismaClient();
}

export default prisma;
