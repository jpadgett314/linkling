/**
 * @typedef {Object} FirefoxBaseNode
 * @property {string} guid - Tends to be 12 base64 chars
 * @property {string} title - Display name
 * @property {number} index - Position of the item within its parent folder
 * @property {number} dateAdded - Microsecond timestamp
 * @property {number} lastModified - Microsecond timestamp
 * @property {number} id - Database ID
 * @property {string} type - e.g., 'text/x-moz-place'
 * @property {string} [root] - e.g., 'placesRoot', 'toolbarFolder'
 */

/**
 * @typedef {FirefoxBaseNode & { typeCode: 1, uri: string, iconUri?: string, tags?: string }} FirefoxBookmark
 */

/**
 * @typedef {FirefoxBaseNode & { typeCode: 2, children?: Array<FirefoxBookmark | FirefoxFolder> }} FirefoxFolder
 */

/**
 * The root object of a Firefox bookmark backup JSON file.
 * @typedef {FirefoxFolder} FirefoxBookmarkBackup
 */

export {};
