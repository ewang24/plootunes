import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { TableUtil } from "../db/tableUtil";
import { PropertiesUtil } from "../util/propertiesUtil";

const db = new Database(`${PropertiesUtil.initProps()}/plootunes.sqlite`, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

TableUtil.createAllTables(db);