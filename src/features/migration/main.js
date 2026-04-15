import path from 'node:path';
import fs from 'node:fs/promises';
import writeFileAtomic from 'write-file-atomic';
import { convertFirefox } from './firefox/convertFirefoxTree.js';
import { prunePlaceholders } from './firefox/placeholders.js';
import { flatten, pruneEmpty, resolvePaths, untagAll } from './treeTransform.js';

const discardedTags = [
  'menu',
  'mobile',
  'root',
  'toolbar',
  'unfiled',
];

async function load(jsonPath) {
  const tree0 = JSON.parse(await fs.readFile(jsonPath));
  const tree1 = convertFirefox(tree0);
  const tree2 = prunePlaceholders(tree1);
  const tree3 = pruneEmpty(tree2);
  const tree4 = flatten(tree3, 1);

  for (const tag of discardedTags) {
    untagAll(tree4, tag);
  }

  return tree4;
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

const initPath = 'converted';
const tree = await load('./bookmarks-2026-04-12 - コピー.json');
// const tree = await load('./bookmarks-2026-04-12.json');

resolvePaths(tree, initPath);
// await save(tree);
console.log(JSON.stringify(tree, null, 2));
