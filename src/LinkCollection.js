import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @typedef {object} Bookmark
 * @property {string} name
 * @property {string} url
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {object} CollectionDoc
 * @property {number} id
 * @property {string} name
 * @property {number} version
 * @property {Bookmark[]} bookmarks
 */

function normalizeUrl(url) {
  return String(url).trim();
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const out = [];
  for (const t of tags) {
    const s = String(t).trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/**
 * Persists one link collection to a JSON file. Writes to disk after changes.
 */
export class LinkCollection {
  /** @param {string} filePath Absolute or relative path to the collection JSON file */
  constructor(filePath) {
    this._filePath = path.resolve(filePath);
    /** @type {CollectionDoc | null} */
    this._doc = null;
    /** @type {Map<string, number>} tag -> refcount */
    this._tagCounts = new Map();
    /** @type {Map<string, number>} normalized url -> bookmark index */
    this._urlIndex = new Map();
  }

  get filePath() {
    return this._filePath;
  }

  get id() {
    return this._doc?.id;
  }

  get name() {
    return this._doc?.name;
  }

  get version() {
    return this._doc?.version;
  }

  /** @returns {Bookmark[]} */
  get bookmarks() {
    return this._doc ? [...this._doc.bookmarks] : [];
  }

  _requireLoaded() {
    if (!this._doc) throw new Error('Collection not loaded; call load() or initialize() first');
  }

  _rebuildIndexes() {
    this._tagCounts.clear();
    this._urlIndex.clear();
    if (!this._doc) return;
    this._doc.bookmarks.forEach((b, i) => {
      const u = normalizeUrl(b.url);
      this._urlIndex.set(u, i);
      for (const tag of normalizeTags(b.tags)) {
        this._tagCounts.set(tag, (this._tagCounts.get(tag) ?? 0) + 1);
      }
    });
  }

  _adjustTagsForBookmark(tags, delta) {
    for (const tag of normalizeTags(tags)) {
      const next = (this._tagCounts.get(tag) ?? 0) + delta;
      if (next <= 0) this._tagCounts.delete(tag);
      else this._tagCounts.set(tag, next);
    }
  }

  async _persist() {
    this._requireLoaded();
    const dir = path.dirname(this._filePath);
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${this._filePath}.${process.pid}.${Date.now()}.tmp`;
    const payload = JSON.stringify(this._doc);
    await fs.writeFile(tmp, payload, 'utf8');
    try {
      await fs.rename(tmp, this._filePath);
    } catch (err) {
      if (process.platform === 'win32') {
        await fs.rm(this._filePath, { force: true });
        await fs.rename(tmp, this._filePath);
      } else {
        await fs.rm(tmp, { force: true });
        throw err;
      }
    }
  }

  /**
   * Creates a new collection file. Fails if the file already exists.
   * @param {{ id: number, name: string, version?: number }} opts
   */
  async initialize({ id, name, version = 0 }) {
    try {
      await fs.access(this._filePath);
      throw new Error(`Collection file already exists: ${this._filePath}`);
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code !== 'ENOENT') throw e;
    }
    /** @type {CollectionDoc} */
    this._doc = {
      id,
      name,
      version,
      bookmarks: [],
    };
    this._rebuildIndexes();
    await this._persist();
  }

  /** Load state from disk and rebuild tag/url indexes */
  async load() {
    const raw = await fs.readFile(this._filePath, 'utf8');
    /** @type {CollectionDoc} */
    const doc = JSON.parse(raw);
    if (
      typeof doc.id !== 'number' ||
      typeof doc.name !== 'string' ||
      typeof doc.version !== 'number' ||
      !Array.isArray(doc.bookmarks)
    ) {
      throw new Error(`Invalid collection document: ${this._filePath}`);
    }
    const urls = new Set();
    for (const b of doc.bookmarks) {
      const u = normalizeUrl(b.url);
      if (urls.has(u)) throw new Error(`Duplicate bookmark url in file: ${u}`);
      urls.add(u);
    }
    this._doc = doc;
    this._rebuildIndexes();
  }

  /**
   * Insert or replace a bookmark by url (unique).
   * @param {Omit<Bookmark, 'tags'> & { tags?: string[] }} bookmark
   */
  async saveBookmark(bookmark) {
    this._requireLoaded();
    const url = normalizeUrl(bookmark.url);
    if (!url) throw new Error('Bookmark url is required');

    const next = {
      name: String(bookmark.name ?? ''),
      url,
      description: String(bookmark.description ?? ''),
      tags: normalizeTags(bookmark.tags),
    };

    const idx = this._urlIndex.get(url);
    if (idx !== undefined) {
      const prev = this._doc.bookmarks[idx];
      this._adjustTagsForBookmark(prev.tags, -1);
      this._doc.bookmarks[idx] = next;
    } else {
      this._doc.bookmarks.push(next);
      this._urlIndex.set(url, this._doc.bookmarks.length - 1);
    }
    this._adjustTagsForBookmark(next.tags, +1);
    this._doc.version += 1;
    await this._persist();
  }

  /** @param {string} url */
  getBookmarkByUrl(url) {
    this._requireLoaded();
    const u = normalizeUrl(url);
    const idx = this._urlIndex.get(u);
    if (idx === undefined) return undefined;
    const b = this._doc.bookmarks[idx];
    return { ...b, tags: [...b.tags] };
  }

  /** All distinct tags currently in use */
  getAllTags() {
    this._requireLoaded();
    return [...this._tagCounts.keys()].sort((a, b) => a.localeCompare(b));
  }
}
