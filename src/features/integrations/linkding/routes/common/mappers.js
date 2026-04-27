/** @typedef {import("../../../../library/types").BookmarkRecord} BookmarkRecord */
/** @typedef {import("../../../../library/types").TagMetadata} TagMetadata */

/**
 * @param {BookmarkRecord} bookmark
 */
function mapBookmark(bookmark) {
  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.name,
    description: bookmark.description,
    nodes: '',
    is_archived: false,
    unread: false,
    shared: false,
    tag_names: bookmark.tags,
    date_added: (new Date()).toISOString(),
    date_modified: (new Date()).toISOString(),
  }
}

/**
 * @returns {Partial<BookmarkRecord>}
 */
function mapBookmarkInput(bookmark) {
  const result = {};
  if (bookmark.id) {
    result.id = bookmark.id;
  };
  if (bookmark.url) {
    result.url = bookmark.url;
  }
  if (bookmark.title) {
    result.name = bookmark.title;
  }
  if (bookmark.description) {
    result.description = bookmark.description;
  }
  if (bookmark.tag_names) {
    result.tags = bookmark.tag_names;
  }
  return result;
}

/**
 * @param {TagMetadata} tag
 */
function mapTag(tag) {
  return {
    id: tag.id,
    name: tag.text,
    date_added: (new Date()).toISOString(),
  };
}

export { mapBookmark, mapBookmarkInput, mapTag };
