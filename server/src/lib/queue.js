export default class Queue {
  /**
   * @param {string[]} [items=[]]
   */
  constructor(items = []) {
    this.items = items;
  }

  length() {
    return this.items.length;
  }

  /**
   * @param {string} item
   */
  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.shift();
  }

  toString() {
    return `[ ${this.items.join(", ")} ]`;
  }
}
