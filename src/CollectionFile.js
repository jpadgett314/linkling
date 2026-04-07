import fs from 'node:fs/promises';
import path from 'node:path';
import writeFileAtomic from 'write-file-atomic';
import { Collection } from './Collection.js';
import { CollectionDocSchema } from './schema.js';

/** @implements {Collection} */
class CollectionFile {
  /** @param {string} filePath Absolute or relative path to the collection JSON file */
  constructor(filePath) {
    /** @type {string} */
    this._filePath = path.resolve(filePath);
    /** @type {CollectionDoc | null} */
    this._doc = null;
  }

  /** @returns {number} */
  get id() {
    this._requireLoaded();
    return this._doc.id;
  }

  /** @returns {string} */
  get name() {
    this._requireLoaded();
    return this._doc.name;
  }

  /** @returns {string} */
  get description() {
    this._requireLoaded();
    return this._doc.description;
  }

  /** @param {string} url */
  async find(url) {
    this._requireLoaded();
    return this._doc.bookmarks[url];
  }

  /** @param {Bookmark} bookmark */
  async save(bookmark) {
    this._requireLoaded();
    /** @type {BookmarkData} */
    const { url, name, description, tags } = bookmark;
    this._doc.bookmarks[String(url).trim()] = { name, description, tags };
    this._saveFile();
  }

  /** @returns {IterableIterator<Bookmark>} */
  *[Symbol.iterator]() {
    this._requireLoaded();
    for (const url in this._doc.bookmarks) {
      /** @type {Bookmark} */
      const bookmark = { url, ...this._doc.bookmarks[url] };
      yield bookmark;
    }
  }

  async load() {
    const raw = await fs.readFile(this._filePath, 'utf8');
    this._doc = CollectionDocSchema.parse(JSON.parse(raw));
  }

  async _saveFile() {
    this._requireLoaded();
    const payload = JSON.stringify(this._doc);
    await writeFileAtomic(this._filePath, payload, 'utf8');
  }

  _requireLoaded() {
    if (!this._doc) throw new Error('Collection not loaded; call load() or initialize() first');
  }
}

export { CollectionFile };
