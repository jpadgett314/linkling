/** @typedef {import('./types.js').GlobalBookmark} GlobalBookmark */
/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

import { LibraryFactory } from './LibraryFactory.js';
import { urlToId, tagToId } from './models/common/ids.js';
import { BookmarkCollections } from './models/BookmarkCollections.js';
import { Bookmarks } from './models/Bookmarks.js';
import { Tags } from './models/Tags.js';
import { CollectionFile } from './CollectionFile.js';

class Library {
  /** @param {CollectionFile[]} collections */
  constructor(collections) {
    /** @type {Map<number, CollectionFile>} */
    this._collections = new Map(collections.map(c => [c.getMetadata().id, c]));
    /** @type {Map<number, string>} */
    this._tagIndex = new Map();
    /** @type {Map<number, string>} */
    this._urlIndex = new Map();
    /** @type {BookmarkCollections} */
    this._bookmarkCollectionsModel = new BookmarkCollections(collections);
    /** @type {Bookmarks} */
    this._bookmarksModel = new Bookmarks(this._collections, this._tagIndex, this._urlIndex, this);
    /** @type {Tags} */
    this._tagsModel = new Tags(this._tagIndex);
  }

  /**
   * @param {string} libraryDirectory
   */
  async init(libraryDirectory) {
    const factory = new LibraryFactory(libraryDirectory);
    const obj = await factory.makeLibrary();
    Object.assign(this, obj);
  }

  /**
   * Indices must be built before querying tags/bookmarks.
   */
  async buildIndex() {
    this._tagIndex.clear();
    for (const collection of this._collections.values()) {
      for (const bookmark of collection) {
        for (const tag of bookmark.tags ?? []) {
          this._tagIndex.set(await tagToId(tag), tag);
        }
        this._urlIndex.set(await urlToId(bookmark.url), bookmark.url);
      }
    }
  }

  /**
   * @returns {IterableIterator<GlobalBookmark>}
   */
  *[Symbol.iterator]() {
    for (const [id, collection] of this._collections.entries()) {
      for (const bookmark of collection) {
        const global = { collectionId: id, ...bookmark };
        yield global;
      }
    }
  }

  get BookmarkCollections() {
    return this._bookmarkCollectionsModel;
  }

  get Bookmarks() {
    return this._bookmarksModel;
  }

  get Tags() {
    return this._tagsModel;
  }
}

export { Library };
