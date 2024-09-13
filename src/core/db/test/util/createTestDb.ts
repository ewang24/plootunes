import { TableUtil } from "../../tableUtil";
import { FileUtil } from "../../../../electron/util/fileUtil";
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";

const fs = require('fs');
const path = require('path');
process.env.DB_PATH = `${path.resolve(__dirname, '../assets/plootunes.sqlite')}`;

const db = new Database(process.env.DB_PATH, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

TableUtil.createAllTables(db).then(() => {
    console.log('Done');
  });

FileUtil.scanFiles(path.resolve(__dirname, process.argv[2]));