import fs from 'node:fs/promises';
import path from 'node:path';
import { CollectionFile } from './CollectionFile.js';
import { Library } from './Library.js';

/**
 * @param {string} dir Directory containing JSON collection files
 * @returns {Promise<CollectionFile[]>}
 */
async function loadJsonDir(dir) {
  return Promise.all(
    (await fs.readdir(dir))
      .filter(f => f.endsWith(".json"))
      .map(f => path.resolve(dir, f))
      .map(path => new CollectionFile(path))
      .map(async file => { await file.load(); return file })
  );
}

/**
 * Throws if multiple collections are using the same ID.
 * @param {Collection[]} collections 
 */
function ensureUnique(collections) {
  /** @type {Map<number, string>} collectionId -> name */
  const seen = new Map();
  for (const collection of collections) {
    const { id, name } = collection.getMetadata();
    if (seen.has(id)) {
      throw new Error(
        `Duplicate collection id detected: ${id} between` + 
        `collection "${name}" and ` + 
        `collection "${seen.get(id)}."`
      );
    }
    seen.set(id, name);
  }
}

class LibraryFactory {
  /** 
   * @param {string} collectionsDir Path to directory containing collection JSON files 
   */
  constructor(collectionsDir) {
    /** @type {string} */
    this._dir = path.resolve(collectionsDir);
  }

  /**
   * @returns {Promise<Library>} Queryable Library
   */
  async makeLibrary() {
    const collections = await loadJsonDir(this._dir);
    ensureUnique(collections);
    const library = new Library(collections);
    await library.buildIndex();
    return library;
  }
}

export { LibraryFactory };
