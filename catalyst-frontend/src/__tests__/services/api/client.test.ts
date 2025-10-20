import axios from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const interceptors = vi.hoisted(() => ({
  requestHandlers: {} as { success?: (config: any) => any },
  responseHandlers: {} as { success?: (res: any) => any; error?: (err: any) => any },
}));

const instance = vi.hoisted(() => ({
  interceptors: {
    request: { use: vi.fn((success) => ((interceptors.requestHandlers.success = success), 1)) },
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
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => instance),
    isAxiosError: (error: any) => Boolean(error?.isAxiosError),
    __instance: instance,
  },
  create: vi.fn(() => instance),
  isAxiosError: (error: any) => Boolean(error?.isAxiosError),
  __instance: instance,
}));

describe('apiClient singleton', () => {
  let clientModule: typeof import('@/services/api/client');

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    interceptors.requestHandlers.success = undefined;
    interceptors.responseHandlers.success = undefined;
    interceptors.responseHandlers.error = undefined;
    Object.values(instance).forEach((value) => {
      if (typeof value === 'function') {
        (value as vi.Mock).mockClear?.();
      }
    });
    vi.resetModules();
    clientModule = await import('@/services/api/client');
  });

  it('creates one axios instance, applies interceptors, and injects tokens', async () => {
    expect(axios.create).toHaveBeenCalledTimes(1);

    const again = (await import('@/services/api/client')).default;
    expect(again).toBe(clientModule.default);
    expect(axios.create).toHaveBeenCalledTimes(1);

    const config = await interceptors.requestHandlers.success?.({ headers: {} });
    expect(config?.headers.Authorization).toBeUndefined();

    localStorage.setItem('token', 'abc');
    const withToken = await interceptors.requestHandlers.success?.({ headers: {} });
    expect(withToken?.headers.Authorization).toBe('Bearer abc');

    const response = await interceptors.responseHandlers.success?.({ data: 42 });
    expect(response).toEqual({ data: 42 });
  });

  it('clears credentials and redirects to login on 401 responses', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '/initial' };

    localStorage.setItem('token', 'token');
    localStorage.setItem('user', 'user');

    try {
      await expect(
        interceptors.responseHandlers.error?.({ response: { status: 401 } })
      ).rejects.toEqual(expect.objectContaining({ response: { status: 401 } }));
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    } finally {
      window.location = originalLocation;
    }
  });

  it('proxies http verbs to the underlying axios instance', async () => {
    instance.get.mockResolvedValueOnce({ data: 'get' });
    instance.post.mockResolvedValueOnce({ data: 'post' });
    instance.put.mockResolvedValueOnce({ data: 'put' });
    instance.delete.mockResolvedValueOnce({ data: 'delete' });
    instance.patch.mockResolvedValueOnce({ data: 'patch' });

    await expect(clientModule.default.get('ideas', { params: { q: 'x' } })).resolves.toBe('get');
    await expect(clientModule.default.post('ideas', { title: 'New' })).resolves.toBe('post');
    await expect(clientModule.default.put('ideas/1', { title: 'Edit' })).resolves.toBe('put');
    await expect(clientModule.default.delete('ideas/1')).resolves.toBe('delete');
    await expect(clientModule.default.patch('ideas/1', { votes: 1 })).resolves.toBe('patch');

    expect(instance.get).toHaveBeenCalledWith('ideas', { params: { q: 'x' } });
    expect(instance.post).toHaveBeenCalledWith('ideas', { title: 'New' }, undefined);
    expect(instance.put).toHaveBeenCalledWith('ideas/1', { title: 'Edit' }, undefined);
    expect(instance.delete).toHaveBeenCalledWith('ideas/1', undefined);
    expect(instance.patch).toHaveBeenCalledWith('ideas/1', { votes: 1 }, undefined);
  });
});
