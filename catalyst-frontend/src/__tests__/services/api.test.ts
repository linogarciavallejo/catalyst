import axios from 'axios';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ApiClient, ApiErrorHandler } from '@/services/api';

vi.mock('axios', async () => {
  const requestHandlers: { success?: (config: any) => any } = {};
  const responseHandlers: {
    success?: (res: any) => any;
    error?: (err: any) => any;
  } = {};

  const instance = {
    defaults: { headers: { common: {} as Record<string, string> } },
    interceptors: {
      request: {
        use: vi.fn((success) => {
          requestHandlers.success = success;
          return 1;
        }),
      },
      response: {
        use: vi.fn((success, error) => {
          responseHandlers.success = success;
          responseHandlers.error = error;
          return 1;
        }),
      },
    },
    post: vi.fn(),
    get: vi.fn(),
  };

  const mockAxios = {
    create: vi.fn(() => instance),
    isAxiosError: (error: any) => Boolean(error?.isAxiosError),
    __instance: instance,
    __handlers: { requestHandlers, responseHandlers },
  };

  return { default: mockAxios, ...mockAxios };
});

describe('Api utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('sets auth headers and clears them', () => {
    const instance = ApiClient.getInstance();
    expect(axios.create).toHaveBeenCalled();

    ApiClient.setAuthToken('abc');
    expect(localStorage.getItem('authToken')).toBe('abc');
    expect(instance.defaults.headers.common['Authorization']).toBe('Bearer abc');

    ApiClient.clearAuthToken();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(instance.defaults.headers.common['Authorization']).toBeUndefined();
  });

  it('applies request and response interceptors', async () => {
    const handlers = (axios as any).__handlers;
    ApiClient.getInstance();

    localStorage.setItem('authToken', 'token');
    const config = await handlers.requestHandlers.success?.({ headers: {} });
    expect(config?.headers.Authorization).toBe('Bearer token');

    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    try {
      await expect(
        handlers.responseHandlers.error?.({ response: { status: 401 } })
      ).rejects.toEqual(expect.objectContaining({ response: { status: 401 } }));
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(window.location.href).toBe('/login');
    } finally {
      window.location = originalLocation;
    }
  });

  it('normalises errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: { message: 'Not found', details: 'Missing resource' },
      },
      message: 'Request failed',
    };

    expect(ApiErrorHandler.handle(axiosError)).toEqual({
      status: 404,
      message: 'Not found',
      details: 'Missing resource',
    });

    expect(ApiErrorHandler.handle(new Error('Boom'))).toEqual({
      status: 500,
      message: 'Boom',
    });

    expect(ApiErrorHandler.handle('unknown')).toEqual({
      status: 500,
      message: 'An unexpected error occurred',
    });
  });
});
