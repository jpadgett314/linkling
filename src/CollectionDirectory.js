import fs from 'node:fs/promises';
import path from 'node:path';
import { CollectionFile } from './CollectionFile.js';

/**
 * @typedef {object} CollectionMetadata
 * @property {number} id
 * @property {string} name
 * @property {number} version
 */

class CollectionDirectory {
  /** @param {string} collectionsDir Path to directory containing collection JSON files */
  constructor(collectionsDir) {
    /** @type {string} */
    this._dir = path.resolve(collectionsDir);
    /** @type {Map<number, CollectionFile>} collection id -> collection instance */
    this._collections = new Map();
    // /** @type {CollectionMetadata[]} */
    // this._metadata = [];
  }

  get directoryPath() {
    return this._dir;
  }

  /** @returns {CollectionFile[]} */
  get collections() {
    return [...this._collections.values()];
  }

  // TODO -- SIMPLIFY
  async initialize() {
    this._collections.clear();

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

    for (const filePath of jsonFiles) {
      const col = new CollectionFile(filePath);
      await col.load();
      const id = col.id;

      if (this._collections.has(id)) {
        throw new Error(`Duplicate collection id ${id} in file ${filePath}`);
      }

      this._collections.set(id, col);
    }
  }
}

export { CollectionDirectory };
