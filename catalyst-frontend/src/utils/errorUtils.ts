/**
 * Error handling and messaging utilities
 */

import { AxiosError } from "axios";

export interface ErrorResponse {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Extract error message from various error types
 * @param error - Error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Axios error from API
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "Network error. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

/**
 * Extract error status code from various error types
 * @param error - Error object
 * @returns HTTP status code or undefined
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }
  return undefined;
};

/**
 * Check if error is network error
 * @param error - Error object
 * @returns true if network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && !!error.message;
  }
  return false;
};

/**
 * Check if error is 404 Not Found
 * @param error - Error object
 * @returns true if 404 error
 */
export const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 404;
  }
  return false;
};

/**
 * Check if error is 401 Unauthorized
 * @param error - Error object
 * @returns true if 401 error
 */
export const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Check if error is 403 Forbidden
 * @param error - Error object
 * @returns true if 403 error
 */
export const isForbiddenError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 403;
  }
  return false;
};

/**
 * Check if error is 400 Bad Request
 * @param error - Error object
 * @returns true if 400 error
 */
export const isBadRequestError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 400;
  }
  return false;
};

/**
 * Check if error is 429 Too Many Requests
 * @param error - Error object
 * @returns true if 429 error
 */
export const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 429;
  }
  return false;
};

/**
 * Check if error is 5xx Server Error
 * @param error - Error object
 * @returns true if server error
 */
export const isServerError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
};

/**
 * Extract validation errors from API response
 * @param error - Error object
 * @returns Object with field names as keys and error messages as values
 */
export const getValidationErrors = (
  error: unknown
): Record<string, string> => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    if (error.response?.data?.fieldErrors) {
      return error.response.data.fieldErrors;
    }
  }
  return {};
};

/**
 * Convert error to user-friendly error response
 * @param error - Error object
 * @returns Formatted error response
 */
export const formatError = (error: unknown): ErrorResponse => {
  return {
    message: getErrorMessage(error),
    status: getErrorStatus(error),
  };
};

/**
 * Log error with context
 * @param error - Error object
 * @param context - Additional context information
 */
export const logError = (error: unknown, context?: string): void => {
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);

  console.error(
    `[${context || "Error"}]${status ? ` [${status}]` : ""}: ${message}`,
    error
  );
};
