import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { TableUtil } from "../../core/db/tableUtil";
import { PropertiesUtil } from "../util/propertiesUtil";
const fs = require('fs');

async function run() {

  const dbPath = `${PropertiesUtil.initProps()}`;
  let re: string | undefined;

  try {
    console.log('checking db file');
    await fs.promises.access(dbPath);
    console.log('db file deleted.');
    await fs.promises.unlink(`${PropertiesUtil.initProps()}`);
    re = 're';
  }
  catch (error) {
    if (error.code === 'ENOENT') {
      console.log('db file not present, skipping delete.');
      re = '';
    }
    else{
      console.error(error);
    }
  }

  console.log(`preparing to ${re}create db and tables...`);

  const db = new Database(`${PropertiesUtil.initProps()}`, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
    if (err) {
      return console.error(err.message);
    }
  });

  console.log(`db ${re}created`);

  TableUtil.createAllTables(db).then(() => {
    console.log('Done');
  });
}

run();