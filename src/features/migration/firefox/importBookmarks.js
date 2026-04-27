import path from 'node:path';
import fs from 'node:fs/promises';
import writeFileAtomic from 'write-file-atomic';
import { ConfigurationRegistry } from '../../settings/ConfigurationRegistry.js'
import { convertFirefox } from './convertFirefoxTree.js';
import { prunePlaceholders } from './placeholders.js';
import { flatten, pruneEmpty, resolvePaths, untagAll } from '../treeTransform.js';
import { FirefoxBookmarkBackupSchema } from './schema.js';
import { safeFileName } from '../util.js';

const discardedTags = [
  'menu',
  'mobile',
  'root',
  'toolbar',
  'unfiled',
];

async function load(jsonPath) {
  let tree = JSON.parse(await fs.readFile(jsonPath));
  tree = FirefoxBookmarkBackupSchema.parse(tree);
  tree = convertFirefox(tree);
  tree = prunePlaceholders(tree);
  tree = pruneEmpty(tree);
  tree = flatten(tree, 1);

  for (const tag of discardedTags) {
    untagAll(tree, tag);
  }

  return tree;
}

async function save(tree) {
  if (tree.children) {
    tree.children.map(save);
  } else if (tree.collection) {
    const dir = path.dirname(tree.path);
    const doc = JSON.stringify(tree.collection, null, 2);
    await fs.mkdir(dir, { recursive: true });
    await writeFileAtomic(tree.path, doc, 'utf8');
  }
}

/**
 * @param {string} jsonPath
 * @param {ConfigurationRegistry} libraryPath
 */
async function importBookmarks(jsonPath, registry) {
  const libdir = registry.get('libraryDirectory');
  const folderName = safeFileName(`import-${new Date().toISOString()}`);
  const outdir = path.join(libdir, folderName);
  const tree = await load(jsonPath);
  resolvePaths(tree, outdir);
  await save(tree);
  return tree.path;
}

export { importBookmarks };
