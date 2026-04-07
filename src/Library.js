import { Collection } from "./Collection.js";
/** @typedef {import('./types.js').GlobalBookmark} GlobalBookmark */
/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

class Library {
  /** @param {Collection[]} collections */
  constructor(collections) {
    /** @type {Map<number, Collection>} */
    this._collections = new Map(collections.map(c => [c.id, c]));
    /** @type {Set<string>} */
    this._tagIndex = new Set();
  }

  init() {
    this._tagIndex.clear();
    for (const collection of this._collections.values()) {
      for (const bookmark of collection) {
        for (const tag of bookmark.tags ?? []) {
          this._tagIndex.add(tag);
        }
      }
    }
  }

  getAllTags() {
    return [...this._tagIndex].sort((a, b) => a.localeCompare(b));
  }

  /** @returns {CollectionMetadata[]} */
  getAllMetadata() {
    return [...this._collections.values()].map(({ id, name, description, color }) => ({
      id,
      name,
      description,
      color,
    }));
  }

  /** 
   * @param {string} url 
   * @returns {GlobalBookmark[]} 
   */
  async findUrl(url) {
    /** @type {GlobalBookmark[]} */
    const matches = [];
    for (const collection of this._collections.values()) {
      const bookmark = await collection.find(url);
      if (bookmark) {
        matches.push({ collectionId: collection.id, url, ...bookmark });
      }
    }
    return matches;
  }

  /** @param {GlobalBookmark} bookmark */
  async saveBookmark(bookmark) {
    const collection = this._collections.get(bookmark.collectionId);
    if (!collection) {
      throw new Error(`Collection not found: ${bookmark.collectionId}`);
    }

    await collection.save(bookmark);

    for (const tag of bookmark.tags ?? []) {
      this._tagIndex.add(tag);
    }
  }
}

export { Library };
