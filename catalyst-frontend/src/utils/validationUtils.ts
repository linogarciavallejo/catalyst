/**
 * Validation utilities for forms and data
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and requirements met
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
} => {
  const requirements = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const isValid = Object.values(requirements).every(Boolean);

  return { isValid, ...requirements };
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate username format (alphanumeric, underscores, hyphens, 3-20 chars)
 * @param username - Username to validate
 * @returns true if username is valid
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Check if string is empty or whitespace only
 * @param str - String to check
 * @returns true if string is empty or whitespace
 */
export const isEmpty = (str: string): boolean => {
  return str.trim().length === 0;
};

/**
 * Check if value is positive number
 * @param value - Value to check
 * @returns true if value is positive number
 */
export const isPositiveNumber = (value: unknown): boolean => {
  return typeof value === "number" && value > 0 && !isNaN(value);
};

/**
 * Check if value is non-negative number
 * @param value - Value to check
 * @returns true if value is non-negative number
 */
export const isNonNegativeNumber = (value: unknown): boolean => {
  return typeof value === "number" && value >= 0 && !isNaN(value);
};

/**
 * Validate minimum string length
 * @param str - String to validate
 * @param minLength - Minimum required length
 * @returns true if string meets minimum length
 */
export const validateMinLength = (str: string, minLength: number): boolean => {
  return str.length >= minLength;
};

/**
 * Validate maximum string length
 * @param str - String to validate
 * @param maxLength - Maximum allowed length
 * @returns true if string is within maximum length
 */
export const validateMaxLength = (str: string, maxLength: number): boolean => {
  return str.length <= maxLength;
};

/**
 * Validate string length range
 * @param str - String to validate
 * @param minLength - Minimum required length
 * @param maxLength - Maximum allowed length
 * @returns true if string is within range
 */
export const validateLengthRange = (
  str: string,
  minLength: number,
  maxLength: number
): boolean => {
  return str.length >= minLength && str.length <= maxLength;
};

/**
 * Validate array is not empty
 * @param arr - Array to validate
 * @returns true if array has items
 */
export const isNotEmpty = <T>(arr: T[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Type guard: check if value is string
 * @param value - Value to check
 * @returns true if value is string
 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

/**
 * Type guard: check if value is number
 * @param value - Value to check
 * @returns true if value is number
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value);
};

/**
 * Type guard: check if value is boolean
 * @param value - Value to check
 * @returns true if value is boolean
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

/**
 * Type guard: check if value is object (not null or array)
 * @param value - Value to check
 * @returns true if value is object
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};
