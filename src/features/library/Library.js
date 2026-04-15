import { Collection } from "./Collection.js";

/** @typedef {import('./types.js').GlobalBookmark} GlobalBookmark */
/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

class Library {
  /** @param {Collection[]} collections */
  constructor(collections) {
    /** @type {Map<number, Collection>} */
    this._collections = new Map(collections.map(c => [c.getMetadata().id, c]));
    /** @type {Set<string>} */
    this._tagIndex = new Set();
  }

  /**
   * Indices must be built before querying tags/bookmarks.
   */
  async buildIndex() {
    this._tagIndex.clear();
    for (const collection of this._collections.values()) {
      for (const bookmark of collection) {
        for (const tag of bookmark.tags ?? []) {
          this._tagIndex.add(tag);
        }
      }
    }
  }

  /**
   * @param {string} url
   * @returns {Promise<GlobalBookmark[]>}
   */
  async findUrl(url) {
    const matches = await Promise.all(
      this._collections.entries().map(
        ([id, collection]) => {
          return collection.find(url).then(b => {
            return b ? { url, collectionId: id, ...b } : null
          })
        }
      )
    )
    return matches.filter(e => e != null);
  }

  /**
   * @param {GlobalBookmark} bookmark
   */
  async saveBookmark(bookmark) {
    const collectionId = bookmark.collectionId;
    const collection = this._collections.get(collectionId);
    if (collection) {
      await collection.save(bookmark);
      for (const tag of bookmark.tags ?? []) {
        this._tagIndex.add(tag);
      }
    } else {
      throw new Error(`Collection not found: ${collectionId}`);
    }
  }

  /**
   * @param {number} collectionId
   * @returns {CollectionMetadata}
   */
  getMetadata(collectionId) {
    collectionId = Math.round(collectionId);
    const collection = this._collections.get(collectionId);
    if (collection) {
      return collection.getMetadata();
    } else {
      return null;
    }
  }

  /**
   * @param {number} collectionId
   * @returns {GlobalBookmark[]}
   */
  getBookmarks(collectionId) {
    collectionId = Math.round(collectionId);
    const collection = this._collections.get(collectionId);
    if (collection) {
      return Array.from(collection);
    } else {
      return [];
    }
  }

  /**
   * @returns {string[]}
   */
  getAllTags() {
    return [...this._tagIndex].sort((a, b) => a.localeCompare(b));
  }

  /**
   * @returns {CollectionMetadata[]}
   */
  getAllMetadata() {
    return [...this._collections.values()].map(c => c.getMetadata());
  }
}

export { Library };
