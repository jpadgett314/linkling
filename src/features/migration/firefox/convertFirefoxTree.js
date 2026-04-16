import { randomColor, randomId } from "../util.js";

/** @typedef {import('./types.js').FirefoxBookmark} FirefoxBookmark */
/** @typedef {import('./types.js').FirefoxFolder} FirefoxFolder */
/** @typedef {import('./types.js').FirefoxBookmarkBackup} FirefoxBookmarkBackup */
/** @typedef {import('./treeTypes.js').IntermediateNode} IntermediateNode */
/** @typedef {import('./treeTypes.js').IntermediateTree} IntermediateTree */

/**
 * @param {FirefoxBookmark} place
 * @returns {*}
 */
function placeToBookmark(place) {
  const bookmark = {};
  if ('title' in place) {
    bookmark.name = place.title;
  }
  if ('tags' in place) {
    bookmark.tags = place.tags.split(',');
  }
  return [place.uri, bookmark];
}

/**
 * @param {FirefoxBookmark[]} places
 * @returns {*}
 */
function placesToBookmarks(places) {
  const [head, ...tail] = places;
  if (head == null) {
    return {};
  } else {
    const pair = placeToBookmark(head);
    const rest = placesToBookmarks(tail);
    rest[pair[0]] = pair[1];
    return rest;
  }
}

/**
 * @param {FirefoxBookmark[]} places
 * @param {string} title
 * @returns {IntermediateNode}
 */
function placesToNode(places, title) {
  let guid;
  if (places?.length > 0) {
    guid = places[0].guid || randomId();
  } else {
    guid = randomId();
  }
  return {
    path: `${guid}.json`,
    collection: {
      id: randomId(),
      name: title,
      color: randomColor(),
      version: 1,
      bookmarks: placesToBookmarks(places)
    }
  };
}

/**
 * @param {FirefoxFolder} container
 * @returns {IntermediateNode}
 */
function containerToNode(container) {
  const { title, children = [] } = container;
  const {
    'text/x-moz-place': places = [],
    'text/x-moz-place-container': containers = []
  } = Object.groupBy(children, child => child.type);
  return {
    path: title,
    children: [
      placesToNode(places, title),
      ...containersToNodes(containers)
    ]
  };
}

/**
 * @param {FirefoxFolder[]} containers
 * @returns {IntermediateNode[]}
 */
function containersToNodes(containers) {
  const [head, ...tail] = containers;
  if (head == null) {
    return [];
  } else {
    return [containerToNode(head), ...containersToNodes(tail)];
  }
}

/**
 * @param {FirefoxBookmarkBackup} container
 * @return {IntermediateTree}
 */
function convertFirefox(container) {
  if (!container.title || container.title == '') {
    // Title required as it may become a filesystem folder name
    container.title = 'root';
  }
  return containerToNode(container);
}

export { convertFirefox };
