import fs from 'node:fs/promises';
import path from 'node:path';
import { LinkCollection } from './LinkCollection.js';

/**
 * @typedef {object} CollectionMetadata
 * @property {number} id
 * @property {string} name
 * @property {number} version
 */

/**
 * Manages all collection JSON files in a directory.
 * Loads each collection into memory and keeps a global tag index.
 */
export class CollectionDirectory {
  /** @param {string} collectionsDir Path to directory containing collection JSON files */
  constructor(collectionsDir) {
    this._dir = path.resolve(collectionsDir);
    /** @type {Map<number, LinkCollection>} collection id -> collection instance */
    this._collections = new Map();
    /** @type {CollectionMetadata[]} */
    this._metadata = [];
    /** @type {Set<string>} */
    this._allTags = new Set();
    /** @type {Map<string, { collectionId: number, url: string, name: string }[]>} */
    this._urlIndex = new Map();
  }

  get directoryPath() {
    return this._dir;
  }

  /**
   * Scan the directory for *.json files, load all collections, and build indexes.
   * Ensures collection ids are unique across files.
   */
  async initialize() {
    this._collections.clear();
    this._metadata = [];
    this._allTags.clear();
    this._urlIndex.clear();

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
      const col = new LinkCollection(filePath);
      await col.load();
      const id = col.id;
      const name = col.name;
      const version = col.version;

      if (typeof id !== 'number' || typeof name !== 'string' || typeof version !== 'number') {
        throw new Error(`Invalid collection document shape: ${filePath}`);
      }
      if (this._collections.has(id)) {
        throw new Error(`Duplicate collection id ${id} in file ${filePath}`);
      }

      this._collections.set(id, col);
      found.push({ id, name, version });

      for (const tag of col.getAllTags()) {
        this._allTags.add(tag);
      }

      // index bookmarks by URL for fast search
      for (const b of col.bookmarks) {
        const url = String(b.url).trim();
        if (!url) continue;
        const entry = { collectionId: id, url, name: b.name };
        const list = this._urlIndex.get(url);
        if (list) list.push(entry);
        else this._urlIndex.set(url, [entry]);
      }
    }

    found.sort((a, b) => a.id - b.id);
    this._metadata = found;
  }

  /** Metadata for every discovered collection, sorted by id */
  getAllMetadata() {
    return this._metadata.map(({ id, name, version }) => ({ id, name, version }));
  }

  /** All distinct tags across all collections */
  getAllTags() {
    return [...this._allTags].sort((a, b) => a.localeCompare(b));
  }

  /** Return search hits for an exact URL */
  searchByUrl(url) {
    const key = String(url).trim();
    if (!key) return [];
    return this._urlIndex.get(key) ?? [];
  }

  /**
   * Save or update a bookmark in a specific collection and update indexes.
   * @param {{ collectionId: number, name: string, url: string, description?: string, tags?: string[] }} input
   */
  async saveBookmark(input) {
    const col = this._collections.get(input.collectionId);
    if (!col) {
      throw new Error(`Unknown collection id ${input.collectionId}`);
    }

    const url = String(input.url ?? '').trim();
    if (!url) {
      throw new Error('Bookmark url is required');
    }

    const tags = Array.isArray(input.tags) ? input.tags : [];

    // delegate persistence & per-collection tag index to LinkCollection
    await col.saveBookmark({
      name: input.name,
      url,
      description: input.description ?? '',
      tags,
    });

    // update global tag index (simple union is enough)
    for (const t of tags) {
      const name = String(t).trim();
      if (name) this._allTags.add(name);
    }

    // rebuild URL index entries for this collection only
    for (const [key, list] of this._urlIndex.entries()) {
      const remaining = list.filter((e) => e.collectionId !== input.collectionId);
      if (remaining.length === 0) this._urlIndex.delete(key);
      else this._urlIndex.set(key, remaining);
    }
    const bookmarks = col.bookmarks;
    for (const b of bookmarks) {
      const u = String(b.url).trim();
      if (!u) continue;
      const entry = { collectionId: input.collectionId, url: u, name: b.name };
      const list = this._urlIndex.get(u);
      if (list) list.push(entry);
      else this._urlIndex.set(u, [entry]);
    }
  }
}
