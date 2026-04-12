import fs from 'node:fs/promises';
import path from 'node:path';
import writeFileAtomic from 'write-file-atomic';
import DEFAULT_COLLECTION from './defaultCollection.json' with { type: 'json' };
import { Mutex } from 'async-mutex';
import { Collection } from './Collection.js';
import { CollectionDocSchema } from './schema.js';

/** @typedef {import('./types.js').Bookmark} Bookmark */
/** @typedef {import('./types.js').BookmarkData} BookmarkData */
/** @typedef {import('./types.js').CollectionDoc} CollectionDoc */
/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

/** @implements {Collection} */
class CollectionFile {
  constructor() {
    /** @type {Mutex} */
    this._mutex = new Mutex();
  }

  /**
   * @param {string} filePath Absolute or relative path to JSON collection file
   */
  static async fromExisting(filePath) {
    const obj = new CollectionFile();
    /** @type {string} */
    obj._path = path.resolve(filePath);
    /** @type {CollectionDoc} */
    obj._doc = CollectionDocSchema.parse(
      JSON.parse(await fs.readFile(obj._path, 'utf8'))
    );
    return obj;
  }

  /**
   * @param {string} folderPath Location to create new collection file
   */
  static async fromDefaults(folderPath) {
    const obj = new CollectionFile();
    /** @type {string} */
    obj._path = path.resolve(folderPath, `links-${Date.now()}.json`);
    /** @type {CollectionDoc} */
    obj._doc = CollectionDocSchema.parse(DEFAULT_COLLECTION);
    await obj.sync();
    return obj;
  }

  /**
   * @returns {CollectionMetadata}
   */
  getMetadata() {
    const { bookmarks, ...metadata } = this._doc;
    return metadata;
  }

  /**
   * @returns {IterableIterator<Bookmark>}
   */
  *[Symbol.iterator]() {
    for (const url in this._doc.bookmarks) {
      const bookmark = { url, ...this._doc.bookmarks[url] };
      yield bookmark;
    }
  }

  /**
   * @param {string} url
   */
  async find(url) {
    const normalizedUrl = String(url).trim();
    return await this._mutex.runExclusive(() => {
      return this._doc.bookmarks[normalizedUrl];
    });
  }

  /**
   * @param {Bookmark} bookmark
   */
  async save(bookmark) {
    const { url, name, description, tags } = bookmark;
    const normalizedUrl = String(url).trim();
    return await this._mutex.runExclusive(async () => {
      this._doc.bookmarks[normalizedUrl] = { name, description, tags };
      await this.sync();
    });
  }

  /**
   * Sync collection changes to JSON file (one way)
   */
  async sync() {
    const payload = JSON.stringify(this._doc, null, 2);
    await writeFileAtomic(this._path, payload, 'utf8');
  }
}

export { CollectionFile };
