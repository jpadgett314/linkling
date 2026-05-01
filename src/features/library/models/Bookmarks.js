/** @typedef {import("../types.js").Bookmark} Bookmark */
/** @typedef {import("../types.js").BookmarkRecord} BookmarkRecord */

import { CollectionFile } from '../CollectionFile.js';
import { BookmarkSchema } from '../schema.js';
import { BookmarkIterable } from '../types.js';
import { filter } from './common/filterBookmarks.js';
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
   * @param {Partial<BookmarkRecord>} query
   */
  async find(query) {
    const { id, url, collectionId } = query;
    /** @type {null | string} */
    const indexedUrl = this._urlIndex.get(id);
    /** @type {null | CollectionFile} */
    const collection = this._collections.get(collectionId);
    /** @type {null | Bookmark} */
    const bookmarkMatchingUrl = collection?.find(url ?? indexedUrl);
    /** @type {Partial<BookmarkRecord>} */
    const filters = { url: indexedUrl, ...query };

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
}

export { Bookmarks };
