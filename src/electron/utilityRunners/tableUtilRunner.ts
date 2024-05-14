import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { TableUtil } from "../db/tableUtil";
import { PropertiesUtil } from "../util/propertiesUtil";


const dbPath = `${PropertiesUtil.initProps()}`;
console.log(`Opening/Creating DB at ${dbPath}`);
const db = new Database(dbPath, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

TableUtil.createAllTables(db);