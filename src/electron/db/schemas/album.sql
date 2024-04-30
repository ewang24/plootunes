CREATE TABLE IF NOT EXISTS album (
          id INTEGER PRIMARY KEY,
          name TEXT,
          artistId INTEGER,
          FOREIGN KEY (artistId) REFERENCES artist(id)
      )