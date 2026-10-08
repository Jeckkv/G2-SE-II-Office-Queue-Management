import db from "#/database/database.js";
import Service from "#/models/services/service.js";

export default class ServiceRepository {
  /**
   * @returns all the services stored in the database.
   */
  static getAll() {
    const rows = db.prepare("SELECT * FROM services").all();
    return rows.map(
      // @ts-ignore
      ({ id, tag, name, code_prefix, service_time }) =>
        new Service({
          id: id,
          tag: tag,
          name: name,
          codePrefix: code_prefix,
          serviceTime: service_time,
        }),
    );
  }
}
