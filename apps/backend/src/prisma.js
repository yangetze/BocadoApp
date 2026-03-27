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
    },
    ingredient: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    baseRecipeIngredient: {
      findFirst: jest.fn(),
    },
    superRecipeDirectIngredient: {
      findFirst: jest.fn(),
    },
    baseRecipe: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    superRecipeBaseRecipe: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn()
  };
} else {
  prisma = new PrismaClient();
}

export default prisma;
