/**
 * Generates next and previous pagination URLs
 * @param {string} fullPath - The base URL (e.g., http://localhost:3000/api/tags)
 * @param {number} limit - Current limit
 * @param {number} offset - Current offset
 * @param {number} totalCount - Total items in the database
 * @returns {object} - { next: string|null, previous: string|null }
 */
const getPaginationUrls = (fullPath, limit, offset, totalCount) => {
  const nextOffset = offset + limit;
  const prevOffset = offset - limit;

  const next = nextOffset < totalCount
    ? `${fullPath}/?limit=${limit}&offset=${nextOffset}`
    : null;

  const previous = offset > 0
    ? `${fullPath}/?limit=${limit}&offset=${Math.max(0, prevOffset)}`
    : null;

  return { next, previous };
};

export { getPaginationUrls };
