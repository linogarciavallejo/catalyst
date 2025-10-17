/**
 * Date formatting and manipulation utilities
 */

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? "s" : ""} ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? "s" : ""} ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? "s" : ""} ago`;

  return then.toLocaleDateString();
};

/**
 * Format date as short date string (e.g., "Jan 15, 2024")
 * @param date - Date to format
 * @returns Short date string
 */
export const formatShortDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date as full date string with time (e.g., "January 15, 2024 2:30 PM")
 * @param date - Date to format
 * @returns Full date string with time
 */
export const formatFullDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date as time only (e.g., "2:30 PM")
 * @param date - Date to format
 * @returns Time string
 */
export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get start of day for a given date
 * @param date - Date to process
 * @returns Start of day (00:00:00)
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of day for a given date
 * @param date - Date to process
 * @returns End of day (23:59:59)
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Add days to a date
 * @param date - Start date
 * @param days - Number of days to add
 * @returns New date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if date is today
 * @param date - Date to check
 * @returns true if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const today = getStartOfDay();
  const checkDate = getStartOfDay(new Date(date));
  return today.getTime() === checkDate.getTime();
};

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns true if date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns true if date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  return new Date(date) > new Date();
};
