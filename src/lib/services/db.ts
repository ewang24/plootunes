import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";

// open database in memory
let db = new Database('plootunes.db', OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// close the database connection
db.close((err: Error | null) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});
