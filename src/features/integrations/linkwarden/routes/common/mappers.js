/** @typedef {import('../../../../library/types.js').CollectionMetadata} CollectionMetadata */
/** @typedef {import('../../../../library/types.js').Bookmark} Bookmark */
/** @typedef {import('../../../../library/types.js').BookmarkRecord} BookmarkRecord */

/**
 * @param {CollectionMetadata} metadata
 */
function mapCollection(metadata) {
  return {
    id: metadata.id,
    name: metadata.name,
    color: metadata.color,
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString(),
    description: metadata.description ?? '',
    icon: 'folder',
    iconWeight: 'regular',
    isPublic: true,
    members: [],
    ownerId: 1,
    createdById: 1,
    parent: null,
    parentId: null,
    _count: {
      links: metadata.count
    },
  };
}

/**
 * @param {string} name
 * @param {number} idx
 */
function mapTag(name, idx) {
  return {
    id: idx + 1,
    name,
    ownerId: 1,
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString(),
    _count: { links: 0 },
  };
}

/**
 * @param {object} payload
 * @param {number} payload.collectionId
 * @param {string} payload.url
 * @param {string} payload.name
 * @param {string} payload.description
 * @param {unknown[]} payload.rawTags
 * @param {unknown} payload.collection
 * @param {unknown} payload.image
 */
function mapStoredLink(payload) {
  return {
    id: Date.now(),
    collectionId: payload.collectionId,
    url: payload.url,
    name: payload.name,
    description: payload.description,
    collection: payload.collection ?? { id: payload.collectionId },
    tags: payload.rawTags,
    image: payload.image,
  };
}

/**
 * @param {BookmarkRecord} bookmark
 * @param {CollectionMetadata} metadata
 */
function mapSearchLink(bookmark, metadata) {
  return {
    id: bookmark.id,
    url: bookmark.url,
    name: bookmark.name,
    description: bookmark.description,
    createdById: 1,
    collectionId: metadata.id,
    color: '#000000',
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString(),
    pinnedBy: [],
    tags: bookmark.tags.map((tag, idx) => mapTag(tag, idx)),
    collection: mapCollection(metadata),
  };
}

export { mapCollection, mapTag, mapStoredLink, mapSearchLink };
