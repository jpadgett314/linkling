/**
 * @typedef {object} BookmarkData
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {object} Bookmark
 * @property {string} url
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {object} GlobalBookmark
 * @property {number} collectionId
 * @property {string} url
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {object} BookmarkRecord
 * @property {number} id
 * @property {number} collectionId
 * @property {string} url
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {object} CollectionMetadata
 * @property {number} id
 * @property {string} name
 * @property {string} color - Hex Code (#xxxxxx)
 * @property {string} version
 * @property {number} count
 */

/**
 * @typedef {object} CollectionDoc
 * @property {number} id
 * @property {string} name
 * @property {string} color - Hex Code (#xxxxxx)
 * @property {number} version
 * @property {Object<string, BookmarkData>} bookmarks
 */

/**
 * @typedef {object} TagMetadata
 * @property {number} id
 * @property {string} text
 */

/** @interface */
class BookmarkIterable {
  /**
   * @returns {IterableIterator<Bookmark>}
   */
  *[Symbol.iterator]() {}
}

export { BookmarkIterable };
