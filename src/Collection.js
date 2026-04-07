/** @interface */
class Collection {
  /**
   * @return {CollectionMetadata}
   */
  getMetadata() {}

  /** 
   * @param {string} url 
   * @returns {Bookmark | undefined}
   */
  async find(url) {}

  /** 
   * @param {Bookmark} bookmark 
   */
  async save(bookmark) {}

  /** 
   * @returns {IterableIterator<Bookmark>} 
   */
  *[Symbol.iterator]() {}
}

export { Collection };
