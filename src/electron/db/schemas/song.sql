CREATE TABLE IF NOT EXISTS song (
          id INTEGER PRIMARY KEY,
          name TEXT,
          albumId INTEGER,
          FOREIGN KEY (albumId) REFERENCES album(id)
      )