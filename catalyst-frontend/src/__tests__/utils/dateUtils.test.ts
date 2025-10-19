import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addDays,
  formatFullDateTime,
  formatRelativeTime,
  formatShortDate,
  formatTime,
  getEndOfDay,
  getStartOfDay,
  isFuture,
  isPast,
  isToday,
} from '@/utils/dateUtils';

const FIXED_NOW = new Date('2024-06-01T12:00:00Z');

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats relative time for seconds ago', () => {
    expect(formatRelativeTime(new Date(FIXED_NOW.getTime() - 30_000))).toBe('just now');
  });

  it('formats relative time for minutes ago', () => {
    expect(formatRelativeTime(new Date(FIXED_NOW.getTime() - 5 * 60_000))).toBe('5 minutes ago');
  });

  it('formats relative time for hours ago', () => {
    expect(formatRelativeTime(new Date(FIXED_NOW.getTime() - 2 * 3_600_000))).toBe('2 hours ago');
  });

  it('formats relative time for days ago', () => {
    expect(formatRelativeTime(new Date(FIXED_NOW.getTime() - 3 * 86_400_000))).toBe('3 days ago');
  });

  it('formats relative time using locale date for older dates', () => {
    expect(formatRelativeTime(new Date('2024-01-01T00:00:00Z'))).toBe(new Date('2024-01-01T00:00:00Z').toLocaleDateString());
  });

  it('formats short date strings', () => {
    const expected = new Date('2024-06-15T00:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    expect(formatShortDate('2024-06-15T00:00:00Z')).toBe(expected);
  });

  it('formats full date and time strings', () => {
    expect(formatFullDateTime('2024-06-15T18:30:00Z')).toBe(
      new Date('2024-06-15T18:30:00Z').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  it('formats time strings', () => {
    expect(formatTime('2024-06-15T18:30:00Z')).toBe(
      new Date('2024-06-15T18:30:00Z').toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  it('gets start of day', () => {
    const start = getStartOfDay(new Date('2024-06-15T18:30:00Z'));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  it('gets end of day', () => {
    const end = getEndOfDay(new Date('2024-06-15T18:30:00Z'));
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });

  it('adds days to date', () => {
    const date = new Date('2024-06-01T00:00:00Z');
    const newDate = addDays(date, 5);
    expect(newDate.getDate()).toBe(6);
    expect(date.getDate()).toBe(1);
  });

  it('checks today correctly', () => {
    expect(isToday(FIXED_NOW)).toBe(true);
    expect(isToday(addDays(FIXED_NOW, 1))).toBe(false);
  });

  it('checks past and future dates', () => {
    expect(isPast(addDays(FIXED_NOW, -1))).toBe(true);
    expect(isPast(addDays(FIXED_NOW, 1))).toBe(false);
    expect(isFuture(addDays(FIXED_NOW, 1))).toBe(true);
    expect(isFuture(addDays(FIXED_NOW, -1))).toBe(false);
  });
});
