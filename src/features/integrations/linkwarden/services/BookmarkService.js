class BookmarkService {
  constructor(library) {
    this._library = library;
  }

  /** @param {any} body */
  async createFromBody(body) {
    const collectionId = Number(body?.collection?.id ?? 0);
    const rawTags = Array.isArray(body?.tags) ? body.tags : [];
    const tags = rawTags
      .map((t) => (typeof t === 'string' ? t : t?.name))
      .filter((t) => typeof t === 'string' && t.trim().length > 0);

    const payload = {
      collectionId,
      name: body?.name,
      url: body?.url,
      description: body?.description ?? '',
      tags,
    };

    await this._library.Bookmarks.save(payload);

    return {
      ...payload,
      rawTags,
      image: body?.image,
      collection: body?.collection,
    };
  }

  /** @param {unknown} searchQueryString */
  async searchLinks(searchQueryString) {
    const query = String(searchQueryString ?? '');
    const urlMatch = /^url:(.+)$/.exec(query);
    if (!urlMatch) return [];
    const targetUrl = decodeURIComponent(urlMatch[1].trim());
    if (!targetUrl) return [];
    return await this._library.Bookmarks.find({ url: targetUrl });
  }
}

export { BookmarkService };
