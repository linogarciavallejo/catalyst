import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import { AxiosError } from 'axios';
import {
  formatError,
  getErrorMessage,
  getErrorStatus,
  getValidationErrors,
  isBadRequestError,
  isForbiddenError,
  isNetworkError,
  isNotFoundError,
  isRateLimitError,
  isServerError,
  isUnauthorizedError,
  logError,
} from '@/utils/errorUtils';

type AxiosErrorData = {
  message?: string;
  errors?: Record<string, string>;
  fieldErrors?: Record<string, string>;
};

const createAxiosError = (
  status?: number,
  data: AxiosErrorData = {},
  message = 'Request failed',
  includeResponse = true,
): AxiosError<AxiosErrorData> => {
  const response = includeResponse
    ? {
        status,
        statusText: 'Error',
        headers: {},
        config: {} as any,
        data,
      }
    : undefined;

  return new AxiosError(message, 'ERR', {} as any, {} as any, response);
};

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('extracts message from axios error response payload', () => {
      const error = createAxiosError(400, { message: 'Invalid' });
      expect(getErrorMessage(error)).toBe('Invalid');
    });

    it('falls back to axios error message', () => {
      const error = createAxiosError(undefined, {}, 'Network down');
      expect(getErrorMessage(error)).toBe('Network down');
    });

    it('uses a generic message when axios error lacks response and message', () => {
      const error = createAxiosError(undefined, {}, '', false);
      expect(getErrorMessage(error)).toBe('Network error. Please try again.');
    });

    it('handles generic errors and strings', () => {
      expect(getErrorMessage(new Error('Oops'))).toBe('Oops');
      expect(getErrorMessage('Text error')).toBe('Text error');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });
  });

  describe('status helpers', () => {
    it('extracts status codes and categorizes errors', () => {
      const notFound = createAxiosError(404);
      const unauthorized = createAxiosError(401);
      const forbidden = createAxiosError(403);
      const badRequest = createAxiosError(400);
      const rateLimit = createAxiosError(429);
      const serverError = createAxiosError(500);
      const networkError = createAxiosError(undefined, {}, 'network fail', false);

      expect(getErrorStatus(notFound)).toBe(404);
      expect(isNotFoundError(notFound)).toBe(true);
      expect(isUnauthorizedError(unauthorized)).toBe(true);
      expect(isForbiddenError(forbidden)).toBe(true);
      expect(isBadRequestError(badRequest)).toBe(true);
      expect(isRateLimitError(rateLimit)).toBe(true);
      expect(isServerError(serverError)).toBe(true);
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('returns false for non-axios errors', () => {
      expect(getErrorStatus(new Error('test'))).toBeUndefined();
      expect(isNetworkError(new Error('test'))).toBe(false);
      expect(isNotFoundError(new Error('test'))).toBe(false);
    });
  });

  describe('validation error extraction', () => {
    it('prefers errors property over fieldErrors', () => {
      const error = createAxiosError(422, {
        errors: { email: 'Invalid' },
        fieldErrors: { email: 'Legacy' },
      });
      expect(getValidationErrors(error)).toEqual({ email: 'Invalid' });
    });

    it('returns fieldErrors when provided', () => {
      const error = createAxiosError(422, {
        fieldErrors: { password: 'Too short' },
      });
      expect(getValidationErrors(error)).toEqual({ password: 'Too short' });
    });

    it('returns empty object for unknown errors', () => {
      expect(getValidationErrors(new Error('oops'))).toEqual({});
    });
  });

  describe('formatting and logging', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    afterEach(() => {
      consoleSpy.mockClear();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it('formats error responses', () => {
      const error = createAxiosError(500, { message: 'Server exploded' });
      expect(formatError(error)).toEqual({
        message: 'Server exploded',
        status: 500,
      });
    });

    it('logs errors with context information', () => {
      const error = createAxiosError(503, { message: 'Unavailable' });
      logError(error, 'Chat');
      expect(consoleSpy).toHaveBeenCalledWith('[Chat] [503]: Unavailable', error);
    });

    it('omits status labels when not provided', () => {
      const error = new Error('Boom');
      logError(error);
      expect(consoleSpy).toHaveBeenCalledWith('[Error]: Boom', error);
    });
  });
});
