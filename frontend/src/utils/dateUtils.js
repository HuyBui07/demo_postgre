/**
 * Parses a date string (preferably YYYY-MM-DD) or a Date object into a Date object,
 * explicitly treating YYYY-MM-DD as UTC to avoid timezone shifts.
 * @param {string | Date} dateStringOrObject - The date string or Date object.
 * @returns {Date} A Date object.
 */
export const parseAsUTCDate = (dateStringOrObject) => {
  if (!dateStringOrObject) {
    return new Date(NaN); // Return an invalid date if input is null or undefined
  }

  // If it's already a Date object, return it directly
  if (dateStringOrObject instanceof Date) {
    return dateStringOrObject;
  }

  // If it's a YYYY-MM-DD string, parse as UTC
  if (typeof dateStringOrObject === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStringOrObject)) {
    const parts = dateStringOrObject.split('-');
    // Month is 0-indexed for Date.UTC()
    return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
  }

  // For other string formats or types, attempt direct parsing
  // This might be risky for non-standard formats, but provides a fallback
  return new Date(dateStringOrObject);
};

/**
 * Formats a date string or Date object to 'DD/MM/YYYY' format using UTC parts.
 * @param {string | Date} dateStringOrObject - The date string or Date object.
 * @returns {string} Formatted date string or 'N/A' or 'Invalid Date'.
 */
export const formatUTCDateToDDMMYYYY = (dateStringOrObject) => {
  if (!dateStringOrObject) return 'N/A';
  const date = parseAsUTCDate(dateStringOrObject);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth is 0-indexed
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date string or Date object to 'YYYY-MM-DD' format using UTC parts,
 * suitable for HTML date input fields.
 * @param {string | Date} dateStringOrObject - The date string or Date object.
 * @returns {string} Formatted date string or empty string or 'Invalid Date'.
 */
export const formatDateToInput = (dateStringOrObject) => {
  if (!dateStringOrObject) return '';
  const date = parseAsUTCDate(dateStringOrObject);
  if (isNaN(date.getTime())) return ''; // Return empty for invalid date for input field

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};