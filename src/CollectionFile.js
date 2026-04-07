import fs from 'node:fs/promises';
import path from 'node:path';
import writeFileAtomic from 'write-file-atomic';
import { Collection } from './Collection.js';
import { CollectionDocSchema } from './schema.js';

/** @typedef {import('./types.js').Bookmark} Bookmark */
/** @typedef {import('./types.js').BookmarkData} BookmarkData */
/** @typedef {import('./types.js').CollectionDoc} CollectionDoc */
/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

/** @implements {Collection} */
class CollectionFile {
  /** 
   * @param {string} filePath Absolute or relative path to the collection JSON file 
   */
  constructor(filePath) {
    /** @type {string} */
    this._filePath = path.resolve(filePath);
    /** @type {CollectionDoc | null} */
    this._doc = null;
  }

  /** 
   * @returns {CollectionMetadata} 
   */
  getMetadata() {
    this._requireLoaded();
    /** @type {CollectionDoc} */
    const { bookmarks, ...metadata } = this._doc;
    return metadata;
  }

  /** 
   * @param {string} url 
   */
  async find(url) {
    this._requireLoaded();
    return this._doc.bookmarks[String(url).trim()];
  }

  /** 
   * @param {Bookmark} bookmark 
   */
  async save(bookmark) {
    this._requireLoaded();
    /** @type {BookmarkData} */
    const { url, name, description, tags } = bookmark;
    this._doc.bookmarks[String(url).trim()] = { name, description, tags };
    this._saveFile();
  }

  /** 
   * @returns {IterableIterator<Bookmark>} 
   */
  *[Symbol.iterator]() {
    this._requireLoaded();
    for (const url in this._doc.bookmarks) {
      /** @type {Bookmark} */
      const bookmark = { url, ...this._doc.bookmarks[url] };
      yield bookmark;
    }
  }

  /**
   * Must load JSON before querying collection
   */
  async load() {
    this._doc = CollectionDocSchema.parse(
      JSON.parse(
        await fs.readFile(this._filePath, 'utf8')
      )
    );
  }

  /**
   * Sync collection and JSON file
   */
  async _saveFile() {
    this._requireLoaded();
    const payload = JSON.stringify(this._doc);
    await writeFileAtomic(this._filePath, payload, 'utf8');
  }

  /**
   * Ensures that this.load() has been called before query
   */
  _requireLoaded() {
    if (!this._doc) {
      throw new Error('Collection not loaded; call load() first.');
    }
  }
}

export { CollectionFile };
