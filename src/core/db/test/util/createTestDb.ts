import { TableUtil } from "../../tableUtil";
import { LibrarySetupService } from "../../../../electron/services/system/librarySetupService";
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { DbUtil } from "../../dbUtil";
const path = require('path');

export class CreateTestDb {
  static async createTestDb(librarySource: string, dbPath: string): Promise<void> {
    const db = new Database(dbPath, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
    });


    await TableUtil.createAllTables(db);
    console.log('Created all tables in test database.');
    const librarySetupService = new LibrarySetupService(librarySource, dbPath)
    await librarySetupService.scanFiles();

    console.timeLog('Preparing to close test database');
    return DbUtil.close(db);
  }
}
