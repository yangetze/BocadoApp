/* global describe, it, expect, jest, beforeEach, afterEach, global */
import { api } from '../api';

describe('api.js - fetchWithAuth', () => {
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    global.fetch = jest.fn();
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      configurable: true,
      writable: true
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.location = originalLocation;
    jest.restoreAllMocks();
  });

  it('successful response returns data', async () => {
    const mockData = { id: 1, name: 'Test' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await api.get('/test');

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
    expect(result).toEqual({ data: mockData });
  });

  it('401 Unauthorized removes token and redirects', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
    });

    try {
      await api.get('/protected');
    } catch (error) { // eslint-disable-line no-unused-vars

      // Expected to throw
    }

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('/');
  });

  it('throws Error object with response property on error', async () => {
    const errData = { error: 'Invalid request' };
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue(errData),
    });

    let thrownError;
    try {
      await api.get('/bad-request');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError).toBeInstanceOf(Error);
    expect(thrownError.message).toBe('Invalid request');
    expect(thrownError.response).toEqual({
      data: errData,
      status: 400
    });
  });

  it('handles error when JSON parsing fails', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('SyntaxError')),
    });

    let thrownError;
    try {
      await api.get('/server-error');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError).toBeInstanceOf(Error);
    expect(thrownError.message).toBe('HTTP error! status: 500');
    expect(thrownError.response).toEqual({
      data: null,
      status: 500
    });
  });

  it('uses Authorization header if token exists', async () => {
    window.localStorage.getItem.mockReturnValue('fake-token');
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    await api.get('/test');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token'
        })
      })
    );
  });
});
