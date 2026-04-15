const prefixes = [
  'place:'
];

function isPlaceholder(url) {
  return prefixes.some(prefix => url.startsWith(prefix));
}

function prunePlaceholders(tree) {
  if (tree.children) {
    tree.children = tree.children.map(prunePlaceholders);
  } else if (tree.collection) {
    tree.collection = prunePlaceholders(tree.collection);
  } else if (tree.bookmarks) {
    const entries = Object.entries(tree.bookmarks);
    tree.bookmarks = entries.filter(
      ([key, _]) => !isPlaceholder(key)
    );
    tree.bookmarks = Object.fromEntries(tree.bookmarks);
  }
  return tree;
}

export { prunePlaceholders };
