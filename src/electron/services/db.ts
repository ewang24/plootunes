import { Database, OPEN_CREATE, OPEN_READONLY, OPEN_READWRITE, RunResult, Statement } from "sqlite3";

export class DbUtils {

  // static async fetchSongs(): Promise<string>{
  //   const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_READONLY, (err: Error | null) => {
  //     if (err) {
  //       return console.error(err.message);
  //     }
  //     console.log('Connected to the in-memory SQlite database.');
  //   });

  //   const query = `
  //     SELECT * FROM song 
  //   `

  //   return this.fetch(db, query);
  // }

  private static fetch(db: Database, query: string): Promise<string> {
    return new Promise((resolve, reject) => {
      db.all(query, function (this: Statement, err: Error | null, rows: []) {
        if (err) {
          reject(err);
        }

        resolve(JSON.stringify(rows));
      });
    })
  }

  static async init(): Promise<void> {
    // open database in memory
    const db = new Database('plootunes.sqlite', OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the in-memory SQlite database.');
    });

    const artistTable = `
    CREATE TABLE IF NOT EXISTS artist (
        id INTEGER PRIMARY KEY,
        name TEXT
    )
  `;

    const albumTable = `
      CREATE TABLE IF NOT EXISTS album (
          id INTEGER PRIMARY KEY,
          name TEXT,
          artistId INTEGER,
          FOREIGN KEY (artistId) REFERENCES artist(id)
      )
    `;

    const songTable = `
      CREATE TABLE IF NOT EXISTS song (
          id INTEGER PRIMARY KEY,
          name TEXT,
          albumId INTEGER,
          FOREIGN KEY (albumId) REFERENCES album(id)
      )
  `;

    db.serialize(() => {
      db.run(artistTable, (err: Error | null) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Processed artist table.');
      });

      db.run(albumTable, (err: Error | null) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Processed album table.');
      });

      db.run(songTable, (err: Error | null) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Processed song table.');
      });
    });


    // let insertedId: number = await this.insertArtist(db, 'test artist 1');
    // console.log(`awaited and inserted test artist: ${insertedId}`);
    // const albumId = await this.insertAlbum(db, 'test album 1', insertedId);
    // console.log(`awaited and inserted test test album: ${insertedId}`);

    // for (let i = 1; i <= 10; i++) {
    //   const songId = await this.insertSong(db, `test song ${i}`, albumId);
    //   console.log(`awaited and inserted test song ${i}: ${songId}`);
    // }



    // close the database connection
    db.close((err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });
  }

  private static insertArtist(db: Database, name: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const insertArtist = `INSERT INTO artist (name) values (?)`;
      db.run(insertArtist, [name], function (this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        }

        resolve(this.lastID);
      });
    })
  }

  static insertAlbum(): Promise<number> {
    const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_READWRITE, (err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the in-memory SQlite database.');
    });

    return new Promise((resolve, reject) => {
      const insertArtist = `INSERT INTO album (name, artistId) values (?, ?)`;
      db.run(insertArtist, ['444', "2"], function (this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        }

        resolve(this.lastID);
      });
    })
  }

  private static insertSong(db: Database, name: string, albumId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const insertArtist = `INSERT INTO song (name, albumId) values (?, ?)`;
      db.run(insertArtist, [name, albumId], function (this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        }

        resolve(this.lastID);
      });
    })
  }
}
