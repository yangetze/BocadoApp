import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}));

jest.unstable_mockModule('../src/prisma.js', () => ({
  default: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

const { default: jwt } = await import('jsonwebtoken');
const { default: prisma } = await import('../src/prisma.js');
const { verifyToken, authenticateToken, requireAdmin, isAdmin } = await import('../src/middleware/authMiddleware.js');

const ERRORS = {
  NO_TOKEN: 'Acceso denegado: No se proporcionó un token de autenticación',
  INACTIVE_USER: 'Usuario inactivo.',
  TOKEN_EXPIRED: 'Tu sesión ha expirado, por favor inicia sesión de nuevo',
  INVALID_TOKEN: 'Token no válido o malformado',
  NOT_ADMIN: 'No tienes los permisos suficientes (ADMIN) para realizar esta acción',
  USER_NOT_FOUND: 'Usuario no encontrado o sesión inválida'
};

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let consoleErrorSpy;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('verifyToken', () => {
    describe('Happy Paths', () => {
      it('should call next() and set req.user when valid token is provided (lowercase header)', async () => {
        const decodedUser = { id: 'user1', username: 'testuser', role: 'USER' };
        mockReq.headers['authorization'] = 'Bearer validtoken';
        jwt.verify.mockReturnValue(decodedUser);
        prisma.user.findUnique.mockResolvedValue({ ...decodedUser, active: true });

        await verifyToken(mockReq, mockRes, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith('validtoken', expect.any(String));
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user1' }, select: expect.any(Object) });
        expect(mockReq.user).toEqual({ ...decodedUser, active: true });
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      it('should call next() and set req.user when valid token is provided (Capitalized header)', async () => {
        const decodedUser = { id: 'user1', username: 'testuser', role: 'USER' };
        mockReq.headers['Authorization'] = 'Bearer validtoken';
        jwt.verify.mockReturnValue(decodedUser);
        prisma.user.findUnique.mockResolvedValue({ ...decodedUser, active: true });

        await verifyToken(mockReq, mockRes, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith('validtoken', expect.any(String));
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user1' }, select: expect.any(Object) });
        expect(mockReq.user).toEqual({ ...decodedUser, active: true });
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      it('should correctly update role if it has changed in the database', async () => {
        const decodedUser = { id: 'user1', username: 'testuser', role: 'USER' };
        const dbUser = { id: 'user1', username: 'testuser', role: 'ADMIN', active: true };
        mockReq.headers['authorization'] = 'Bearer validtoken';
        jwt.verify.mockReturnValue(decodedUser);
        prisma.user.findUnique.mockResolvedValue(dbUser);

        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockReq.user.role).toBe('ADMIN');
      });
    });

    describe('Error Conditions & Edge Cases', () => {
      it('should return 401 when no token is provided', async () => {
        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.NO_TOKEN });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when header is present but malformed (missing Bearer)', async () => {
        mockReq.headers['authorization'] = 'validtoken';

        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.NO_TOKEN });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when user is not found in database', async () => {
        const decodedUser = { id: 'user1' };
        mockReq.headers['authorization'] = 'Bearer validtoken';
        jwt.verify.mockReturnValue(decodedUser);
        prisma.user.findUnique.mockResolvedValue(null);

        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.USER_NOT_FOUND });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 when user is inactive in database', async () => {
        const decodedUser = { id: 'user1' };
        const dbUser = { id: 'user1', active: false };
        mockReq.headers['authorization'] = 'Bearer validtoken';
        jwt.verify.mockReturnValue(decodedUser);
        prisma.user.findUnique.mockResolvedValue(dbUser);

        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.INACTIVE_USER });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when token has expired', async () => {
        mockReq.headers['authorization'] = 'Bearer expiredtoken';
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        jwt.verify.mockImplementation(() => { throw error; });

        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.TOKEN_EXPIRED });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 when token is invalid or malformed', async () => {
        mockReq.headers['authorization'] = 'Bearer invalidtoken';
        jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

        await verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.INVALID_TOKEN });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('requireAdmin', () => {
    describe('Happy Paths', () => {
      it('should call next() if user role is ADMIN', () => {
        mockReq.user = { id: 'user1', role: 'ADMIN' };

        requireAdmin(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    describe('Error Conditions', () => {
      it('should return 403 if user role is not ADMIN', () => {
        mockReq.user = { id: 'user1', role: 'USER' };

        requireAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.NOT_ADMIN });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 if req.user is undefined', () => {
        requireAdmin(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: ERRORS.NOT_ADMIN });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('Aliases', () => {
    it('authenticateToken should be identical to verifyToken', () => {
      expect(authenticateToken).toBe(verifyToken);
    });

    it('isAdmin should be identical to requireAdmin', () => {
      expect(isAdmin).toBe(requireAdmin);
    });
  });
});
