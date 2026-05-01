/** @typedef {import("../types").TagMetadata} TagMetadata */

import { tagToId } from './common/ids.js';

class Tags {
  /**
   * @param {Map<number, string>} tagIndex
   */
  constructor(tagIndex) {
    this._tagIndex = tagIndex;
  }

  /**
   * @param {Partial<TagMetadata>} query
   * @return {Promise<TagMetadata[]>}
   */
  async find(query) {
    const id1 = query.id;
    const id2 = query.text? await tagToId(query.text) : null;
    const tag = this._tagIndex.get(id1 ?? id2);
    let matches = [];

    if (!id1 && !id2) {
      matches = Array.from(this._tagIndex.entries());
    } else if (tag) {
      matches = [[id1 || id2, tag]];
    }

    return matches.map(([k, v]) => ({ id: k, text: v }));
  }

  /**
   * NOT IMPLEMENTED
   * @param {TagMetadata} tag
   */
  // async save(tag) {}

  /**
   * NOT IMPLEMENTED
   * @param {Partial<TagMetadata>} query
   */
  // async delete(fields) {}
}

export { Tags };
