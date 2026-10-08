import db from "./src/database/database.js";

const tags = db.prepare("SELECT tag FROM services").all();
console.log(tags);
