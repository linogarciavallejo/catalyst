/**
 * String manipulation and formatting utilities
 */

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to title case (each word capitalized)
 * @param str - String to convert
 * @returns Title case string
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

/**
 * Convert string to sentence case (first letter capitalized)
 * @param str - String to convert
 * @returns Sentence case string
 */
export const toSentenceCase = (str: string): string => {
  if (!str) return "";
  return capitalize(str.toLowerCase());
};

/**
 * Convert camelCase to kebab-case
 * @param str - String to convert
 * @returns Kebab case string
 */
export const camelToKebabCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 * @param str - String to convert
 * @returns Camel case string
 */
export const kebabToCamelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Convert snake_case to camelCase
 * @param str - String to convert
 * @returns Camel case string
 */
export const snakeToCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Truncate string to maximum length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: "...")
 * @returns Truncated string
 */
export const truncate = (
  str: string,
  maxLength: number,
  suffix = "..."
): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Remove whitespace from both ends of string
 * @param str - String to trim
 * @returns Trimmed string
 */
export const trim = (str: string): string => {
  return str.trim();
};

/**
 * Remove all whitespace from string
 * @param str - String to process
 * @returns String without whitespace
 */
export const removeWhitespace = (str: string): string => {
  return str.replace(/\s/g, "");
};

/**
 * Repeat string n times
 * @param str - String to repeat
 * @param count - Number of times to repeat
 * @returns Repeated string
 */
export const repeat = (str: string, count: number): string => {
  return str.repeat(count);
};

/**
 * Replace all occurrences of pattern in string
 * @param str - String to process
 * @param search - Pattern to search for
 * @param replace - Replacement string
 * @returns String with replacements
 */
export const replaceAll = (str: string, search: string, replace: string): string => {
  return str.split(search).join(replace);
};

/**
 * Reverse string
 * @param str - String to reverse
 * @returns Reversed string
 */
export const reverse = (str: string): string => {
  return str.split("").reverse().join("");
};

/**
 * Check if string is palindrome
 * @param str - String to check
 * @returns true if palindrome
 */
export const isPalindrome = (str: string): boolean => {
  const cleaned = str.toLowerCase().replace(/\s/g, "");
  return cleaned === reverse(cleaned);
};

/**
 * Generate slug from string (lowercase, replace spaces with hyphens)
 * @param str - String to slugify
 * @returns Slug string
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * Count occurrences of substring in string
 * @param str - String to search in
 * @param substring - Substring to count
 * @returns Number of occurrences
 */
export const countOccurrences = (str: string, substring: string): number => {
  if (!substring) return 0;
  return str.split(substring).length - 1;
};

/**
 * Get random string of specified length
 * @param length - Length of random string
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 */
export const randomString = (
  length: number,
  charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Highlight search term in string with markers
 * @param str - String to process
 * @param searchTerm - Term to highlight
 * @param markerStart - Start marker (default: "**")
 * @param markerEnd - End marker (default: "**")
 * @returns String with highlighted terms
 */
export const highlight = (
  str: string,
  searchTerm: string,
  markerStart = "**",
  markerEnd = "**"
): string => {
  if (!searchTerm) return str;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return str.replace(regex, `${markerStart}$1${markerEnd}`);
};

/**
 * Extract initials from full name
 * @param fullName - Full name string
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string
 */
export const getInitials = (fullName: string, maxInitials = 2): string => {
  return fullName
    .split(" ")
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

/**
 * Format number as currency string
 * @param amount - Amount to format
 * @param currency - Currency code (default: "USD")
 * @param locale - Locale (default: "en-US")
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = "USD",
  locale = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format number with thousands separator
 * @param num - Number to format
 * @param separator - Separator character (default: ",")
 * @returns Formatted number string
 */
export const formatNumber = (num: number, separator = ","): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};
