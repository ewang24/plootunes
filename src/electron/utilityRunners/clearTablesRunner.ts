import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { TableUtil } from "../db/tableUtil";
const fs = require('fs');

fs.unlink('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', (err) => {
    if (err) {
        console.error('Error deleting file:', err);
        return;
    }
    console.log('db file deleted. Preparing to recreate db and tables...');
});

const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

TableUtil.createAllTables(db);