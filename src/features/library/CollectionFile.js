import fs from 'node:fs/promises';
import path from 'node:path';
import writeFileAtomic from 'write-file-atomic';
import DEFAULT_COLLECTION from './defaultCollection.json' with { type: 'json' };
import { Collection } from './Collection.js';
import { CollectionDocSchema } from './schema.js';

/** @typedef {import('./types.js').Bookmark} Bookmark */
/** @typedef {import('./types.js').BookmarkData} BookmarkData */
/** @typedef {import('./types.js').CollectionDoc} CollectionDoc */
/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

/** @implements {Collection} */
class CollectionFile {
  /**
   * @param {string} filePath Absolute or relative path to JSON collection file
   */
  static async fromPath(filePath) {
    const obj = new CollectionFile();
    /** @type {string} */
    obj._filePath = path.resolve(filePath);
    /** @type {CollectionDoc} */
    obj._doc = CollectionDocSchema.parse(
      JSON.parse(await fs.readFile(filePath, 'utf8'))
    );
    obj.sync();
    return obj;
  }

  /**
   * @param {string} folderPath Absolute or relative path to destination folder
   */
  static async fromDefaults(folderPath){
    const obj = new CollectionFile();
    /** @type {string} */
    obj._filePath = path.resolve(folderPath, `links-${Date.now()}.json`);
    /** @type {CollectionDoc} */
    obj._doc = CollectionDocSchema.parse(DEFAULT_COLLECTION);
    obj.sync();
    return obj;
  }

  /**
   * @returns {CollectionMetadata}
   */
  getMetadata() {
    /** @type {CollectionDoc} */
    const { bookmarks, ...metadata } = this._doc;
    return metadata;
  }

  /**
   * @returns {IterableIterator<Bookmark>}
   */
  *[Symbol.iterator]() {
    for (const url in this._doc.bookmarks) {
      /** @type {Bookmark} */
      const bookmark = { url, ...this._doc.bookmarks[url] };
      yield bookmark;
    }
  }

  /**
   * @param {string} url
   */
  async find(url) {
    return this._doc.bookmarks[String(url).trim()];
  }

  /**
   * @param {Bookmark} bookmark
   */
  async save(bookmark) {
    /** @type {BookmarkData} */
    const { url, name, description, tags } = bookmark;
    this._doc.bookmarks[String(url).trim()] = { name, description, tags };
    this.sync();
  }

  /**
   * Sync collection changes to JSON file (one way)
   */
  async sync() {
    const payload = JSON.stringify(this._doc, null, 2);
    await writeFileAtomic(this._filePath, payload, 'utf8');
  }
}

export { CollectionFile };
