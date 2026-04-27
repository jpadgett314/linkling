/** @typedef {import("../types").CollectionMetadata} CollectionMetadata */

import { CollectionFile } from '../CollectionFile.js';

class BookmarkCollections {
  /**
   * @param {Map<number, CollectionFile>} collections
   */
  constructor(collections) {
    this._collections = collections;
  }

  /**
   * @param {Partial<CollectionMetadata>} query
   */
  async find(query) {
    const filters = Object.entries(query);
    /** @type {CollectionMetadata[]} */
    const matches = [];
    for (const collection of this._collections.values()) {
      const meta = collection.getMetadata();
      if (filters.every(([k, v]) => meta[k] == v)) {
        matches.push(meta);
      }
    }
    return Promise.resolve(matches);
  }

  /**
   * TODO: IMPLEMENT
   * @param {CollectionMetadata} collection
   */
  // async save(collection) {}

  /**
   * TODO: IMPLEMENT
   * @param {Partial<CollectionMetadata} query
   */
  // async delete(field) {}

}

export { BookmarkCollections };
