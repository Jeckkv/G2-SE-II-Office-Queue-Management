export default class Service {
  /**
   * @param {Object} service
   * @param {number} service.id Unique service identifier.
   * @param {string} service.tag Tag identifying the service (e.g. SHIPPING).
   * @param {string} service.name Label shown to customers.
   * @param {string} service.codePrefix Letter used in ticket codes (e.g. 'S').
   * @param {number} service.serviceTime Average service time, in minutes.
   */
  constructor({ id, tag, name, codePrefix, serviceTime }) {
    this.id = id;
    this.tag = tag;
    this.name = name;
    this.codePrefix = codePrefix;
    this.serviceTime = serviceTime;
  }
}
