import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'test') {
  // Use mock object in test environment directly without import mocks via jest
  const { jest } = require('@jest/globals');
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
