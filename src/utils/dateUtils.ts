import { 
  format, 
  parse, 
  isValid, 
  startOfDay, 
  endOfDay,
  addDays,
  subDays,
  differenceInDays,
  isBefore,
  isAfter,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';

/**
 * Ensures a value is a valid Date object
 * Handles Date objects, strings, timestamps, and invalid dates
 */
export function ensureDate(input: Date | string | number | null | undefined): Date {
  if (!input) {
    console.warn('ensureDate: received null/undefined, returning current date');
    return new Date();
  }

  // Already a valid Date
  if (input instanceof Date && isValid(input)) {
    return input;
  }

  // Try to parse string or number
  let date: Date;
  
  if (typeof input === 'string') {
    // Try ISO format first
    date = new Date(input);
    
    // If that fails, try other common formats
    if (!isValid(date)) {
      // Try MM/DD/YYYY
      date = parse(input, 'MM/dd/yyyy', new Date());
    }
    
    if (!isValid(date)) {
      // Try YYYY-MM-DD
      date = parse(input, 'yyyy-MM-dd', new Date());
    }
  } else if (typeof input === 'number') {
    date = new Date(input);
  } else {
    date = new Date(String(input));
  }

  // If still invalid, return current date
  if (!isValid(date)) {
    console.error('ensureDate: could not parse date from input:', input);
    return new Date();
  }

  return date;
}

/**
 * Safely formats a date with fallback
 */
export function safeFormat(date: Date | string | null | undefined, formatStr: string = 'MMM d, yyyy'): string {
  try {
    const validDate = ensureDate(date);
    return format(validDate, formatStr);
  } catch (error) {
    console.error('safeFormat error:', error);
    return 'Invalid Date';
  }
}

/**
 * Get the current date at start of day (for consistent comparisons)
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * Check if a date is in the past (comparing at start of day)
 */
export function isPastDue(date: Date | string): boolean {
  const checkDate = startOfDay(ensureDate(date));
  const today = getToday();
  return isBefore(checkDate, today);
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const checkDate = startOfDay(ensureDate(date));
  const today = getToday();
  return isAfter(checkDate, today);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const checkDate = ensureDate(date);
  return isSameDay(checkDate, new Date());
}

/**
 * Get days until a date (negative if past)
 */
export function daysUntil(date: Date | string): number {
  const targetDate = startOfDay(ensureDate(date));
  const today = getToday();
  return differenceInDays(targetDate, today);
}

/**
 * Add days to a date safely
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  return addDays(ensureDate(date), days);
}

/**
 * Subtract days from a date safely
 */
export function subDaysFromDate(date: Date | string, days: number): Date {
  return subDays(ensureDate(date), days);
}

/**
 * Get a human-readable relative date
 */
export function getRelativeDate(date: Date | string): string {
  const days = daysUntil(date);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0 && days <= 7) return `In ${days} days`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
  if (days > 7 && days <= 14) return 'Next week';
  if (days < -7 && days >= -14) return 'Last week';
  
  return safeFormat(date, 'MMM d, yyyy');
}

/**
 * Get the start and end of the current week
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 0 }), // Sunday
    end: endOfWeek(now, { weekStartsOn: 0 })
  };
}

/**
 * Validate if a date is reasonable for scheduling (not too far in past or future)
 */
export function isReasonableDate(date: Date | string): boolean {
  const checkDate = ensureDate(date);
  const today = getToday();
  
  // Allow dates from 1 year ago to 2 years in future
  const minDate = subDays(today, 365);
  const maxDate = addDays(today, 730);
  
  return !isBefore(checkDate, minDate) && !isAfter(checkDate, maxDate);
}

/**
 * Parse a date string with multiple format attempts
 */
export function parseFlexibleDate(dateStr: string): Date | null {
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'MM-dd-yyyy',
    'MMM d, yyyy',
    'MMMM d, yyyy',
    'MM/dd/yy',
    'd MMM yyyy',
    'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx' // ISO format
  ];

  for (const formatStr of formats) {
    try {
      const parsed = parse(dateStr, formatStr, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Try next format
    }
  }

  // Last attempt with native Date constructor
  const native = new Date(dateStr);
  return isValid(native) ? native : null;
}

// Export all functions for convenience
export default {
  ensureDate,
  safeFormat,
  getToday,
  isPastDue,
  isFuture,
  isToday,
  daysUntil,
  addDaysToDate,
  subDaysFromDate,
  getRelativeDate,
  getCurrentWeek,
  isReasonableDate,
  parseFlexibleDate
};