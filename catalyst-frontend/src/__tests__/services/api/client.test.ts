import axios from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const interceptors = vi.hoisted(() => ({
  requestHandlers: {} as { success?: (config: any) => any },
  responseHandlers: {} as { success?: (res: any) => any; error?: (err: any) => any },
}));

vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: {
        use: vi.fn((success) => {
          interceptors.requestHandlers.success = success;
          return 1;
        }),
      },
      response: {
        use: vi.fn((success, error) => {
          interceptors.responseHandlers.success = success;
          interceptors.responseHandlers.error = error;
          return 1;
        }),
      },
    },
    defaults: { headers: { common: {} as Record<string, string> } },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };

  const mockAxios = {
    create: vi.fn(() => instance),
    isAxiosError: (error: any) => Boolean(error?.isAxiosError),
    __instance: instance,
  };

  return { default: mockAxios, ...mockAxios };
});

describe('apiClient singleton', () => {
  let client: typeof import('@/services/api/client').default;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    interceptors.requestHandlers.success = undefined;
    interceptors.responseHandlers.success = undefined;
    interceptors.responseHandlers.error = undefined;
    vi.resetModules();
    ({ default: client } = await import('@/services/api/client'));
  });

  it('creates an axios instance, applies interceptors, and caches it', async () => {
    expect(axios.create).toHaveBeenCalledTimes(1);

    const again = (await import('@/services/api/client')).default;
    expect(again).toBe(client);
    expect(axios.create).toHaveBeenCalledTimes(1);

    const config = await interceptors.requestHandlers.success?.({ headers: {} });
    expect(config?.headers.Authorization).toBeUndefined();

    localStorage.setItem('token', 'abc');
    const configWithToken = await interceptors.requestHandlers.success?.({ headers: {} });
    expect(configWithToken?.headers.Authorization).toBe('Bearer abc');

    const response = await interceptors.responseHandlers.success?.({ data: 1 });
    expect(response).toEqual({ data: 1 });

    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    try {
      await expect(
        interceptors.responseHandlers.error?.({ response: { status: 401 } })
      ).rejects.toEqual(expect.objectContaining({ response: { status: 401 } }));
      expect(localStorage.getItem('token')).toBeNull();
      expect(window.location.href).toBe('/login');
    } finally {
      window.location = originalLocation;
    }
  });
});
