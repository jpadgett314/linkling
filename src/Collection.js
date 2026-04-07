/** @interface */
class Collection {
  /**
   * @returns {number} 
   */
  get id() {}

  /** 
   * @returns {string} 
   */
  get name() {}
  
  /** 
   * @returns {string}
   */
  get description() {}

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
