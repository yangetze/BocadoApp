import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}));

const { default: jwt } = await import('jsonwebtoken');
const { verifyToken, authenticateToken, requireAdmin, isAdmin } = await import('../src/middleware/authMiddleware.js');

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
    it('should call next() and set req.user when valid token is provided', () => {
      const decodedUser = { id: 'user1', username: 'testuser', role: 'USER' };
      mockReq.headers['authorization'] = 'Bearer validtoken';
      jwt.verify.mockReturnValue(decodedUser);

      verifyToken(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('validtoken', expect.any(String));
      expect(mockReq.user).toEqual(decodedUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', () => {
      verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Acceso denegado: No se proporcionó un token de autenticación' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is inactive', () => {
      const decodedUser = { id: 'user1', active: false };
      mockReq.headers['authorization'] = 'Bearer validtoken';
      jwt.verify.mockReturnValue(decodedUser);

      verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuario inactivo.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token has expired', () => {
      mockReq.headers['authorization'] = 'Bearer expiredtoken';
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw error; });

      verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tu sesión ha expirado, por favor inicia sesión de nuevo' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid or malformed', () => {
      mockReq.headers['authorization'] = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

      verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token no válido o malformado' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should call next() if user role is ADMIN', () => {
      mockReq.user = { id: 'user1', role: 'ADMIN' };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not ADMIN', () => {
      mockReq.user = { id: 'user1', role: 'USER' };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No tienes los permisos suficientes (ADMIN) para realizar esta acción' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if req.user is undefined', () => {
      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No tienes los permisos suficientes (ADMIN) para realizar esta acción' });
      expect(mockNext).not.toHaveBeenCalled();
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
