import { TableUtil } from "../../tableUtil";
import { LibrarySetupService } from "../../../../electron/services/system/librarySetupService";
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
const path = require('path');
process.env.DB_PATH = `${path.resolve(__dirname, '../assets/plootunes.sqlite')}`;

const db = new Database(process.env.DB_PATH, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

TableUtil.createAllTables(db).then(() => {
    console.log('Done');

    const librarySetupService = new LibrarySetupService(path.resolve(__dirname, process.argv[2]), process.env.DB_PATH)
    librarySetupService.scanFiles();
  });