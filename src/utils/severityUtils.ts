/**
 * Utility functions for handling crisis severity levels
 */

/**
 * Returns the appropriate CSS class for a given severity level.
 * Used for styling badges and other UI elements based on severity.
 *
 * @param severity - The severity level ('green', 'yellow', or 'red')
 * @returns CSS class string for the given severity
 */
export const getSeverityClass = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'green': return 'bg-green-500 text-green-800';
    case 'yellow': return 'bg-yellow-500 text-black';
    case 'red': return 'bg-red-600 text-white';
    default: return 'bg-green-500 text-white';
  }
};

/**
 * Returns the appropriate hex color code for a given severity level.
 * Used for map markers, charts, and other visual elements.
 *
 * @param severity - The severity level ('green', 'yellow', or 'red')
 * @returns Hex color code for the given severity
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'red':
      return 'var(--crisis-level-red)';
    case 'yellow':
      return 'var(--crisis-level-yellow)';
    case 'green':
      return 'var(--crisis-level-green)';
    default:
      return 'var(--default-blue)';
  }
};
