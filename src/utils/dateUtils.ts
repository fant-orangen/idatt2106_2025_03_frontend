/**
 * Utility functions for date formatting and calculations
 */

/**
 * Format a date to a localized string
 * @param date The date to format
 * @returns Formatted date string in Norwegian locale
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('no-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate the number of days between two dates
 * @param date1 The first date
 * @param date2 The second date
 * @returns The number of days between the two dates
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
};

/**
 * Calculate the number of days left until a date
 * @param date The target date
 * @returns The number of days left until the date
 */
export const daysLeft = (date: Date): number => {
  const today = new Date();
  return daysBetween(today, date);
};

export const formatDateFull = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return 'N/A';
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};
