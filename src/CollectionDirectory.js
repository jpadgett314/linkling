import fs from 'node:fs/promises';
import path from 'node:path';
import { LinkCollection } from './LinkCollection.js';

/**
 * @typedef {object} CollectionMetadata
 * @property {number} id
 * @property {string} name
 * @property {number} version
 * @property {string} filePath
 */

/**
 * Manages all collection JSON files in a directory.
 */
export class CollectionDirectory {
  /** @param {string} collectionsDir Path to directory containing collection JSON files */
  constructor(collectionsDir) {
    this._dir = path.resolve(collectionsDir);
    /** @type {Map<number, string>} collection id -> absolute json path */
    this._idToPath = new Map();
    /** @type {CollectionMetadata[]} */
    this._metadata = [];
  }

  get directoryPath() {
    return this._dir;
  }

  /**
   * Scan the directory for *.json files and register collections by id.
   * Ensures collection ids are unique across files.
   */
  async initialize() {
    this._idToPath.clear();
    this._metadata = [];

    let entries;
    try {
      entries = await fs.readdir(this._dir, { withFileTypes: true });
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code === 'ENOENT') {
        await fs.mkdir(this._dir, { recursive: true });
        entries = await fs.readdir(this._dir, { withFileTypes: true });
      } else {
        throw e;
      }
    }

    const jsonFiles = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.json'))
      .map((e) => path.join(this._dir, e.name));

    /** @type {CollectionMetadata[]} */
    const found = [];

    for (const filePath of jsonFiles) {
      const raw = await fs.readFile(filePath, 'utf8');
      let doc;
      try {
        doc = JSON.parse(raw);
      } catch {
        throw new Error(`Invalid JSON in collection file: ${filePath}`);
      }
      if (
        typeof doc.id !== 'number' ||
        typeof doc.name !== 'string' ||
        typeof doc.version !== 'number' ||
        !Array.isArray(doc.bookmarks)
      ) {
        throw new Error(`Invalid collection document shape: ${filePath}`);
      }
      if (this._idToPath.has(doc.id)) {
        throw new Error(
          `Duplicate collection id ${doc.id}: ${this._idToPath.get(doc.id)} and ${filePath}`,
        );
      }
      this._idToPath.set(doc.id, filePath);
      found.push({
        id: doc.id,
        name: doc.name,
        version: doc.version,
        filePath,
      });
    }

    found.sort((a, b) => a.id - b.id);
    this._metadata = found;
  }

  /** Metadata for every discovered collection, sorted by id */
  getAllMetadata() {
    return this._metadata.map((m) => ({ ...m }));
  }

  /**
   * @param {number} id
   * @returns {Promise<LinkCollection | undefined>}
   */
  async getCollectionById(id) {
    const filePath = this._idToPath.get(id);
    if (!filePath) return undefined;
    const col = new LinkCollection(filePath);
    await col.load();
    return col;
  }
}
