/** @typedef {import("../../types.js").Bookmark} Bookmark */
/** @typedef {import("../../types.js").BookmarkFilters} BookmarkFilters */

import { BookmarkIterable } from '../../types.js';
import { urlToId } from './ids.js';

/**
 * @param {Bookmark} bookmark
 * @param {Partial<BookmarkRecord>} query
 * @returns {boolean}
 */
function matching(bookmark, query) {
  for (const [key, value] of Object.entries(query)) {
    switch (key) {
      case 'id':
        // May be present but not technically part of Bookmark
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
      case 'substring':
        const text = JSON.stringify(bookmark);
        if (text.indexOf(value) >= 0) {
          continue;
        } else {
          return false;
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
 * @param {BookmarkFilters} filters
 */
function filter(iterable, filters) {
  /** @type {Bookmark[]} */
  const matches = [];
  
  for (const bookmark of iterable) {
    if (matching(bookmark, filters)) {
      matches.push(bookmark);
    }
  }

  return matches;
}

/**
 * @param {BookmarkIterable[]} args
 */
function intersection(...args) {
  /** @type {Map<string, { bookmark: Bookmark, count: number }>} */
  const seen = new Map();
  /** @type {Bookmark[]} */
  const results = [];

  for (const iterable of args || []) {
    for (const bookmark of iterable) {
      const hit = seen.get(bookmark.url);
      if (hit) {
        hit.count++;
      } else {
        seen.set(bookmark.url, { bookmark, count: 1 });
      }
    }
  }

  for (const record of seen.values()) {
    if (record.count == args.length) {
      results.push(record.bookmark);
    }
  }
  
  return results;
}

/**
 * @param {BookmarkIterable[]} args
 */
function union(...args) {
  /** @type {Map<string, Bookmark>} */
  const map = new Map();

  for (const iterable of args || []) {
    for (const bookmark of iterable) {
      map.set(bookmark.url, bookmark);
    }
  }

  return Array.from(map.values());
}

/**
 * @param {BookmarkIterable} iterable
 * @returns {Promise<(Bookmark & { id: number })[]>}
 */
async function addIds(iterable) {
  /** @type {Promise<Bookmark>[]} */
  const results = [];

  for (const bookmark of iterable) {
    results.push(urlToId(bookmark.url).then(
      id => (
        {
          id,
          ...structuredClone(bookmark)
        }
      )
    ));
  }

  return Promise.all(results);
}

export { filter, intersection, union, addIds };
