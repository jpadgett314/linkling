/** @typedef {import('./types.js').CollectionMetadata} CollectionMetadata */

/**
 * @param {CollectionMetadata} metadata
 */
function mapCollection(metadata) {
  return {
    id: metadata.id,
    name: metadata.name,
    color: metadata.color,
    createdAt: (new Date()).toISOString(),
    description: metadata.description ?? '',
    isPublic: false,
    members: [],
    ownerId: 1,
    parent: null,
    parentId: null,
    updatedAt: (new Date()).toISOString(),
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
 * @param {{ url: string, name: string }} bookmark
 * @param {number} idx
 */
function mapSearchLink(bookmark, idx) {
  return {
    id: idx + 1,
    url: bookmark.url,
    name: bookmark.name,
  };
}

export { mapCollection, mapTag, mapStoredLink, mapSearchLink };
