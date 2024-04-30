import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { TableUtil } from "./db/tableUtil";

const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });

  TableUtil.createAllTables(db);