export default class NotFoundError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "Not Found";
    this.statusCode = 404;
  }
}
