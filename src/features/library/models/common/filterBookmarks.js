/** @typedef {import("../../types").GlobalBookmark} GlobalBookmark */

import { urlToId } from './ids.js';

/**
 * @param {GlobalBookmark} bookmark
 * @param {Partial<BookmarkRecord>} query
 * @returns {boolean}
 */
function matching(bookmark, query) {
  for (const [key, value] of Object.entries(query)) {
    switch (key) {
      case 'id':
        // Not stored in GlobalBookmark
        continue;
      case 'tags':
        if (Array.isArray(value)) {
          const tagsDesired = new Set(value);
          const tagsPresent = new Set(bookmark.tags);
          if (tagsDesired.isSubsetOf(tagsPresent)) {
            continue;
          } else {
            return false;
          }
        }
      default:
        if (value) {
          if (bookmark[key] === value) {
            continue;
          } else {
            return false;
          }
        }
    }
  }
  return true;
}

/**
 * @param {BookmarkIterable} iterable
 * @param {Partial<BookmarkRecord>} query
 */
async function filter(iterable, query) {
  /** @type {BookmarkRecord[]} */
  const matches = [];
  for (const bookmark of iterable) {
    if (matching(bookmark, query)) {
      matches.push(urlToId(bookmark.url).then(
        id => (
          {
            id,
            ...structuredClone(bookmark)
          }
        )
      ));
    }
  }
  return Promise.all(matches);
}

export { filter };
