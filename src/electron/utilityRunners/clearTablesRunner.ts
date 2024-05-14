import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { TableUtil } from "../db/tableUtil";
import { PropertiesUtil } from "../util/propertiesUtil";
const fs = require('fs');

fs.unlink(`${PropertiesUtil.initProps()}`, (err) => {
    if (err) {
        console.error('Error deleting file:', err);
        return;
    }
    console.log('db file deleted. Preparing to recreate db and tables...');
});

const db = new Database(`${PropertiesUtil.initProps()}`, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

TableUtil.createAllTables(db);