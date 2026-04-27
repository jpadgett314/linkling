/** @typedef {import("../../types").GlobalBookmark} GlobalBookmark */

/**
 * Only ~80k hashes required for 50% chance of collision.
 * @param {string} text
 * @returns {Promise<number>}
 */
async function hashTo32(text) {
  const data = new DataView(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    )
  );
  return data.getUint32(0);
}

/**
 * Only ~20m hashes required for 50% chance of collision.
 * @param {string} text
 * @returns {Promise<number>}
 */
async function hashTo48(text) {
  const data = new DataView(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    )
  );
  const hi = data.getUint16(4) * 2**32;
  const lo = data.getUint32(0);
  return hi + lo;
}

/**
 * Provides no guarantee of unique IDs.
 * @param {string} text
 * @returns {Promise<number>}
 */
async function tagToId(tag) {
  return hashTo48(tag);
}

/**
 * Provides no guarantee of unique IDs.
 * @param {string} url
 * @returns {Promise<number>}
 */
async function urlToId(url) {
  return hashTo48(url);
}

export { tagToId, urlToId };
