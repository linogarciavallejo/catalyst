import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  camelToKebabCase,
  capitalize,
  countOccurrences,
  formatCurrency,
  formatNumber,
  getInitials,
  highlight,
  isPalindrome,
  kebabToCamelCase,
  randomString,
  removeWhitespace,
  repeat,
  replaceAll,
  reverse,
  slugify,
  snakeToCamelCase,
  toSentenceCase,
  toTitleCase,
  trim,
  truncate,
} from '@/utils/stringUtils';

describe('stringUtils', () => {
  describe('basic formatting', () => {
    it('capitalizes strings safely', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });

    it('converts to title case and sentence case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toSentenceCase('HELLO WORLD')).toBe('Hello world');
      expect(toSentenceCase('')).toBe('');
    });

    it('transforms casing variations', () => {
      expect(camelToKebabCase('helloWorld')).toBe('hello-world');
      expect(kebabToCamelCase('hello-world')).toBe('helloWorld');
      expect(snakeToCamelCase('hello_world')).toBe('helloWorld');
    });
  });

  describe('length and trimming utilities', () => {
    it('truncates strings with suffix', () => {
      expect(truncate('abcdefgh', 5)).toBe('ab...');
      expect(truncate('abc', 5)).toBe('abc');
    });

    it('trims and removes whitespace', () => {
      expect(trim('  spaced  ')).toBe('spaced');
      expect(removeWhitespace('a b\tc')).toBe('abc');
    });

    it('repeats strings and replaces content', () => {
      expect(repeat('ab', 3)).toBe('ababab');
      expect(replaceAll('a-b-c', '-', ':')).toBe('a:b:c');
    });
  });

  describe('analysis utilities', () => {
    it('reverses and detects palindromes', () => {
      expect(reverse('abc')).toBe('cba');
      expect(isPalindrome('Race car')).toBe(true);
      expect(isPalindrome('hello')).toBe(false);
    });

    it('slugifies and counts occurrences', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(countOccurrences('banana', 'na')).toBe(2);
      expect(countOccurrences('banana', '')).toBe(0);
    });
  });

  describe('random utilities', () => {
    let mathRandomSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      let call = 0;
      const values = [0.1, 0.5, 0.9];
      mathRandomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
        const value = values[call % values.length];
        call += 1;
        return value;
      });
    });

    afterEach(() => {
      mathRandomSpy.mockRestore();
    });

    it('generates deterministic random strings when Math.random is mocked', () => {
      expect(randomString(3, 'abc')).toBe('abc');
    });
  });

  describe('highlight and initials', () => {
    it('wraps search terms', () => {
      expect(highlight('Hello World', 'world')).toBe('Hello **World**');
      expect(highlight('Hello World', '')).toBe('Hello World');
    });

    it('extracts initials with limits', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('John Ronald Reuel Tolkien', 3)).toBe('JRR');
    });
  });

  describe('formatting numbers', () => {
    it('formats currency and numbers', () => {
      expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe(
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.56),
      );
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });
});
