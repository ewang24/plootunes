import { existsSync, unlinkSync } from "fs";
import { CreateTestDb } from "../../../../core/db/test/util/createTestDb";
import path = require("path");
import { CountFilesInTestLibrary } from "../../../../core/db/test/util/countFilesInTestLibrary";
import { Database, OPEN_READWRITE } from "sqlite3";
import { DbUtil } from "../../../../core/db/dbUtil";
import { Sqlite3Connector } from "../../../db/sqlite3Connector";
import { Connector } from "../../../../core/db/dto/connector";

describe("LibrarySetupService", () => {
  jest.setTimeout(30000);
  const dbPath = path.resolve(__dirname, "./plootunes.sqlite");
  const libraryPath = path.resolve(__dirname, "../../../../core/db/test/assets/testLibrary");
  let connector: Connector;

  beforeAll(async () => {
    if (existsSync(dbPath)) {
      try {
        unlinkSync(dbPath);
        console.log('Deleted pre-existing old test database file.');
      } catch (err) {
        console.error('Error occurred while trying to delete the file:', err);
      }
    } else {
      console.log('No old test database file exists.');
    }

    await CreateTestDb.createTestDb(libraryPath, dbPath);

    const db = new Database(dbPath, OPEN_READWRITE, (err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
    });
    connector = new Sqlite3Connector(db)
  });


  test("Library database exists", () => {
    const libraryExists = existsSync(path.resolve(__dirname, dbPath));
    expect(libraryExists).toBeTruthy();
  });

  describe("Song table tests", () => {
    test("Expected amount of songs records", async () => {
      const countOfFiles = await CountFilesInTestLibrary.count(libraryPath);
      const dbRecordCount = (await connector.get<number>(`SELECT COUNT(*) FROM song`))["COUNT(*)"];
      expect(dbRecordCount).toEqual(countOfFiles);
    })
  });

  afterAll(async () => {
    await connector.close();
    if (existsSync(dbPath)) {
      try {
        unlinkSync(dbPath);
        console.log('Cleaned up test database file.');
      } catch (err) {
        console.error('Error occurred while trying to delete the file:', err);
      }
    } else {
      console.log('No test database file exists, nothing to cleanup.');
    }
  });
})