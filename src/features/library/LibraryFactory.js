import fs from 'node:fs/promises';
import path from 'node:path';
import { CollectionFile } from './CollectionFile.js';
import { Library } from './Library.js';
import { ZodError } from 'zod';

/**
 * Initialize Bookmark Library directory and load JSON collections.
 * @param {string} dir Path to Bookmark Library
 * @returns {Promise<CollectionFile[]>}
 */
async function loadLibrary(dir) {
  await fs.mkdir(dir, { recursive: true });

  /** @type {Set<number, CollectionFile>} collectionId -> obj */
  const matches = new Map();
  /** @type {string[]} */
  const entries = await fs.readdir(dir, { recursive: true });

  const loadCollection = async (name) => {
    if (!(name.endsWith('.json'))) {
      console.log(`Skipping ${name} (non-JSON file)`);
      return;
    }
    try {
      const collection = await CollectionFile.fromExisting(path.join(dir, name));
      const { id, version } = collection.getMetadata();
      if (matches.has(id)) {
        console.log(`Skipping ${name} (repeated ID)`);
      } else if (version != 1 ) {
        console.log(`Skipping ${name} (unsupported version)`);
      } else {
        matches.set(id, collection);
      }
    } catch(error) {
      if (error instanceof SyntaxError) {
        console.log(`Skipping ${name} (invalid JSON)`);
      } else if (error instanceof ZodError) {
        console.log(`Skipping ${name} (invalid collection)`);
      } else {
        throw error;
      }
    }
  }

  await Promise.all(entries.map(loadCollection));

  // Ensure collection with id 0 exists as a default
  // TODO: configurable default collection
  if (!matches.has(0)) {
    matches.set(0, await CollectionFile.fromDefaults(dir));
  }

  return [...matches.values()];
}

class LibraryFactory {
  /**
   * @param {string} libraryDirectory Path to Bookmark Library directory
   */
  constructor(libraryDirectory) {
    /** @type {string} */
    this._dir = path.resolve(libraryDirectory);
  }

  /**
   * @returns {Promise<Library>} Queryable Library
   */
  async makeLibrary() {
    const collections = await loadLibrary(this._dir);
    const library = new Library(collections);
    await library.buildIndex();
    return library;
  }
}

export { LibraryFactory };
