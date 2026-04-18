import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// 1. Mock the auth middleware completely
jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1' };
    next();
  }
}));

// Create mock functions outside
const compareMock = jest.fn();
const hashMock = jest.fn();
const signMock = jest.fn();
const verifyMock = jest.fn();

// Mock bcryptjs properly for ES Modules
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: compareMock,
    hash: hashMock
  }
}));

// Mock jsonwebtoken properly for ES Modules
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: signMock,
    verify: verifyMock
  }
}));


// 1.5 Mock rate limiter
jest.unstable_mockModule('../src/middleware/rateLimitMiddleware.js', () => ({
  authLimiter: (req, res, next) => next()
}));

// 2. Import the routes AFTER the mocks have been set
const { default: authRoutes } = await import('../src/routes/authRoutes.js');

// 3. Import prisma (this will be the test mock version since NODE_ENV='test')
import prisma from '../src/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        identificationNumber: '123456',
        password: 'hashedpassword',
        active: true
      };

      prisma.user.findFirst.mockResolvedValue(mockUser);
      compareMock.mockResolvedValue(true);
      signMock.mockReturnValue('mocked-jwt-token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ loginId: 'testuser', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Inicio de sesión exitoso');
      expect(res.body.token).toBe('mocked-jwt-token');
      expect(res.body.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        identificationNumber: mockUser.identificationNumber
      });
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
      expect(compareMock).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(signMock).toHaveBeenCalled();
    });

    it('should return 400 if loginId or password is not provided', async () => {
      const res1 = await request(app).post('/api/auth/login').send({ password: 'password123' });
      expect(res1.statusCode).toBe(400);
      expect(res1.body.error).toBe('Debes proporcionar tu usuario/email y contraseña');

      const res2 = await request(app).post('/api/auth/login').send({ loginId: 'testuser' });
      expect(res2.statusCode).toBe(400);
      expect(res2.body.error).toBe('Debes proporcionar tu usuario/email y contraseña');
    });

    it('should return 401 if user is not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ loginId: 'wronguser', password: 'password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = { id: '1', username: 'testuser', password: 'hashedpassword', active: true };
      prisma.user.findFirst.mockResolvedValue(mockUser);
      compareMock.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ loginId: 'testuser', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('should return 403 if user is inactive', async () => {
      const mockUser = { id: '1', username: 'testuser', password: 'hashedpassword', active: false };
      prisma.user.findFirst.mockResolvedValue(mockUser);
      compareMock.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ loginId: 'testuser', password: 'password123' });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Usuario inactivo');
    });

    it('should return 500 on internal error', async () => {
      prisma.user.findFirst.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ loginId: 'testuser', password: 'password123' });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register successfully', async () => {
      const newUser = {
        username: 'newuser',
        email: 'new@example.com',
        identificationNumber: '987654',
        name: 'New User'
      };
      const createdUser = {
        id: '2',
        ...newUser,
        password: 'hashedpassword',
        role: 'USER',
        active: true
      };

      hashMock.mockResolvedValue('hashedpassword');
      prisma.user.create.mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Usuario registrado exitosamente');
      expect(res.body.user).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        name: createdUser.name
      });
      expect(hashMock).toHaveBeenCalledWith('987654', 10);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new@example.com' }); // Missing identificationNumber

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Faltan campos obligatorios (usuario, email o cédula)');
    });

    it('should return 400 if email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'invalid-email', identificationNumber: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El formato del correo electrónico no es válido');
    });

    it('should return 400 if username is less than 3 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', email: 'valid@example.com', identificationNumber: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El nombre de usuario debe tener entre 3 y 50 caracteres');
    });

    it('should return 400 if user already exists (Prisma P2002)', async () => {
      const dbError = new Error('Unique constraint failed');
      dbError.code = 'P2002';

      hashMock.mockResolvedValue('hashed');
      prisma.user.create.mockRejectedValue(dbError);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existing', email: 'existing@example.com', identificationNumber: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El usuario, email o cédula ya existen.');
    });

    it('should return 500 on internal error', async () => {
      hashMock.mockRejectedValue(new Error('Hash error'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user', email: 'user@example.com', identificationNumber: '123' });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 'user-default-1',
        username: 'defaultuser',
        email: 'default@example.com',
        name: 'Default User',
        role: 'USER',
        identificationNumber: '111'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-default-1' }
      });
    });

    it('should return 404 if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Usuario no encontrado');
    });

    it('should return 500 on internal error', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error al recuperar perfil de usuario');
    });
  });
});
