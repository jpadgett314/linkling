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
 * @typedef {object} CollectionDoc
 * @property {number} id
 * @property {string} name
 * @property {number} version
 * @property {Object<string, BookmarkData>} bookmarks
 */

export {};
