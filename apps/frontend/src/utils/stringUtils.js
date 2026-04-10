/**
 * Normalizes a string by converting it to lowercase and removing accents.
 * Useful for case-insensitive and accent-insensitive searches.
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string.
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
