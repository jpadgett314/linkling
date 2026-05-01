/** @typedef {import('./treeTypes.js').IntermediateTree} IntermediateTree */
/** @typedef {import('../library/types.js').CollectionDoc} CollectionDoc */

import path from 'node:path';
import { randomId, safeFileName } from './util.js';

/**
 * @param {IntermediateTree} tree - Mutates
 * @param {string} initPath
 * @returns {IntermediateTree}
 */
function resolvePathsHelper(tree, initPath) {
  tree.path = safeFileName(tree.path);
  tree.path = path.join(initPath, tree.path);
  if (tree.children) {
    for (const child of tree.children) {
      resolvePathsHelper(child, tree.path);
    }
  }
  return tree;
}

/**
 * @param {IntermediateTree} tree - Mutates
 * @param {string} initPath
 * @returns {IntermediateTree}
 */
function resolvePaths(tree, initPath) {
  if (tree) {
    initPath = path.resolve(initPath)
    resolvePathsHelper(tree, initPath);
  }
  return tree;
}

/**
 * @param {IntermediateTree} tree - Mutates
 * @returns {IntermediateTree}
 */
function pruneEmpty(tree) {
  if (tree.children) {
    tree.children = tree.children.map(pruneEmpty);
    tree.children = tree.children.filter(child => child);
    if (tree.children.length == 0) {
      return null;
    } else {
      return tree;
    }
  } else if (tree.collection) {
    const keys = Object.keys(tree.collection.bookmarks);
    if (keys.length == 0) {
      return null;
    } else {
      return tree;
    }
  }
}

/**
 * @param {CollectionDoc[]} param0
 * @returns {CollectionDoc}
 */
function combineCollections([head, next, ...tail]) {
  if (head == null) {
    return null;
  } else if (next == null) {
    return head;
  }

  return combineCollections(
    [
      {
        id: head.id,
        name: `${head.name},${next.name}`,
        color: head.color,
        version: head.version,
        bookmarks: { ...head.bookmarks, ...next.bookmarks }
      },
      ...tail
    ]
  );
}

/**
 * @param {CollectionDoc} collection - Mutates
 * @param {string} tag
 * @returns {CollectionDoc}
 */
function tagAll(collection, tag) {
  if (collection?.bookmarks) {
    for (const url of Object.keys(collection.bookmarks)) {
      collection.bookmarks[url].tags ??= [];
      collection.bookmarks[url].tags.push(tag);
    }
  }
  return collection;
}

/**
 * Reduce tree height by merging deepest collections/folders
 * @param {IntermediateTree} tree - Not Mutated
 * @param {number} height
 * @returns {IntermediateTree}
 */
function flatten(tree, height=1) {
  if (!tree || !tree.children || !tree.children.length) {
    return tree;
  }

  /** @type {IntermediateTree[]} */
  const processed = tree.children.map(n => flatten(n, height - 1));

  if (height < 2) {
    const childs = processed.map(c => c.collection);
    const merged = combineCollections(childs);
    const folderName = path.basename(tree.path);
    const parentPath = path.dirname(tree.path);

    // Tag everything with the current folder name to preserve context
    tagAll(merged, safeFileName(folderName));

    return {
      path: path.join(parentPath, `${randomId()}.json`),
      collection: merged
    }
  }

  return {
    ...tree,
    children: processed
  };
}

/**
 * @param {IntermediateTree} tree - Mutates
 * @param {string} tag
 */
function untagAll(tree, tag) {
  if (tree.children) {
    tree.children.map(child => untagAll(child, tag));
  } else if (tree.collection) {
    const { bookmarks } = tree.collection;
      for (const data of Object.values(bookmarks)) {
        if (Array.isArray(data.tags)) {
          data.tags = data.tags.filter(t => t != tag);
        }
    }
  }
}

export { resolvePaths, pruneEmpty, flatten, untagAll };
