/** @typedef {import("../types.js").Bookmark} Bookmark */
/** @typedef {import("../types.js").BookmarkFilters} BookmarkFilters */
/** @typedef {import("../types.js").BookmarkQuery} BookmarkQuery */
/** @typedef {import("../types.js").BookmarkRecord} BookmarkRecord */

import { CollectionFile } from '../CollectionFile.js';
import { BookmarkSchema } from '../schema.js';
import { BookmarkIterable, BookmarkQueryType } from '../types.js';
import { filter, intersection, union, addIds } from './common/filterBookmarks.js';
import { tagToId, urlToId } from './common/ids.js';

class Bookmarks {
  /**
   * @param {Map<number, CollectionFile>} collections
   * @param {Map<number, string>} tagIndex
   * @param {Map<number, string>} urlIndex
   * @param {BookmarkIterable} bookmarks
   */
  constructor(collections, tagIndex, urlIndex, bookmarks) {
    /** @type {BookmarkIterable} */
    this._bookmarks = bookmarks
    /** @type {Map<number, CollectionFile>} */
    this._collections = collections;
    /** @type {Map<number, string>} */
    this._tagIndex = tagIndex;
    /** @type {Map<number, string>} */
    this._urlIndex = urlIndex;
  }

  /**
   * @param {BookmarkFilters} filters
   */
  async find(filters) {
    /** @type {Bookmark[]} */
    const results = this._filter(filters);

    return addIds(results);
  }

  /**
   * @param {BookmarkQuery | null} query 
   */
  async find2(query) {
    /** @type {Bookmark[]} */
    const results = this._search(query);

    return addIds(results);
  }

  /**
   * @param {Partial<BookmarkRecord>} bookmark
   */
  async save(bookmark) {
    const { id, url, collectionId = 0 } = bookmark;

    return await this._saveComplete(
      {
        collectionId,
        ...(await this.find({ id, url, collectionId }))[0],
        ...bookmark
      }
    );
  }

  /**
   * @param {Partial<BookmarkRecord>} query
   */
  async delete(query) {
    /** @type {Partial<BookmarkRecord>} */
    const filters = { collectionId: 0, ...query };
    /** @type {BookmarkRecord[]} */
    const deleted = await this.find(filters);

    for (const { collectionId, url } of deleted) {
      const collection = this._collections.get(collectionId);
      await collection.delete(url);
    }

    return deleted;
  }

  /**
   * @param {Partial<BookmarkRecord>} bookmark
   */
  async _saveComplete(bookmark) {
    try {
      BookmarkSchema.parse(bookmark);
    } catch {
      return null;
    }

    bookmark.tags?.sort();
    const { collectionId = 0 } = bookmark;
    const id = bookmark.id ?? await urlToId(bookmark.url);
    /** @type {BookmarkRecord} */
    const saved = { id, collectionId, ...bookmark };
    const collection = this._collections.get(collectionId);
    await collection.save(saved);
    this._urlIndex.set(id, bookmark.url);
    for (const tag of bookmark?.tags) {
      this._tagIndex.set(await tagToId(tag), tag);
    }

    return saved;
  }

  /**
   * @param {BookmarkQuery | null} query 
   */
  _search(query) {
    /** @type {Bookmark[][]} */
    const found = query?.ops?.map(q => this._search(q));

    switch (query?.type) {
      case BookmarkQueryType.Or:
        return union(...found);
      case BookmarkQueryType.And:
        return intersection(...found);
      case BookmarkQueryType.Leaf:
        return this._filter(query.filters || {});
      default:
        return [];
    }
  }

  /**
   * @param {BookmarkFilters} fields
   */
  _filter(fields) {
    const { id, url, collectionId } = fields;
    /** @type {null | string} */
    const indexedUrl = this._urlIndex.get(id);
    /** @type {null | CollectionFile} */
    const collection = this._collections.get(collectionId);
    /** @type {null | Bookmark} */
    const bookmarkMatchingUrl = collection?.find(url ?? indexedUrl);
    /** @type {BookmarkFilters} */
    const filters = { url: indexedUrl, ...fields };

    if (id && !indexedUrl) {
      return [];
    } else if (!collectionId) {
      return filter(this._bookmarks, filters);
    } else if (!collection) {
      return [];
    } else if (!url && !indexedUrl) {
      return filter(collection, filters);
    } else if (!bookmarkMatchingUrl) {
      return [];
    } else {
      return filter([bookmarkMatchingUrl], filters);
    }
  }
}

export { Bookmarks };
