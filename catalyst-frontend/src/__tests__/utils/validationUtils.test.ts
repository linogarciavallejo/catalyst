import { describe, it, expect } from 'vitest';
import {
  isBoolean,
  isEmpty,
  isNonNegativeNumber,
  isNotEmpty,
  isNumber,
  isObject,
  isPositiveNumber,
  isString,
  isValidEmail,
  isValidUrl,
  isValidUsername,
  validateLengthRange,
  validateMaxLength,
  validateMinLength,
  validatePassword,
} from '@/utils/validationUtils';

describe('validationUtils', () => {
  it('validates email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('validates password strength', () => {
    const strong = validatePassword('Aa1!aaaa');
    expect(strong.isValid).toBe(true);
    expect(strong.hasMinLength).toBe(true);

    const weak = validatePassword('abc');
    expect(weak.isValid).toBe(false);
    expect(weak.hasUppercase).toBe(false);
    expect(weak.hasSpecialChar).toBe(false);
  });

  it('validates url formats', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('validates usernames', () => {
    expect(isValidUsername('user_name')).toBe(true);
    expect(isValidUsername('x')).toBe(false);
  });

  it('checks string emptiness', () => {
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('data')).toBe(false);
  });

  it('validates numeric states', () => {
    expect(isPositiveNumber(5)).toBe(true);
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber(-0.1)).toBe(false);
  });

  it('validates string length helpers', () => {
    expect(validateMinLength('abc', 2)).toBe(true);
    expect(validateMaxLength('abc', 5)).toBe(true);
    expect(validateLengthRange('abc', 2, 5)).toBe(true);
    expect(validateLengthRange('abc', 4, 5)).toBe(false);
  });

  it('validates arrays and type guards', () => {
    expect(isNotEmpty([1, 2, 3])).toBe(true);
    expect(isNotEmpty([])).toBe(false);
    expect(isString('str')).toBe(true);
    expect(isString(123)).toBe(false);
    expect(isNumber(123)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean('true')).toBe(false);
    expect(isObject({})).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(false);
  });
});
