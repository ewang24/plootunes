--Create artist table
CREATE TABLE IF NOT EXISTS artist (
    id INTEGER PRIMARY KEY,
    name TEXT
);

--Create album table
 CREATE TABLE IF NOT EXISTS album (
    id INTEGER PRIMARY KEY,
    name TEXT,
    artistId INTEGER,
    FOREIGN KEY (artistId) REFERENCES artist(id)
);

--Create song table
CREATE TABLE IF NOT EXISTS song (
    id INTEGER PRIMARY KEY,
    name TEXT,
    albumId INTEGER,
    FOREIGN KEY (albumId) REFERENCES album(id)
);