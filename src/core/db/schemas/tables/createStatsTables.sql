CREATE TABLE IF NOT EXISTS songStat (
        year INTEGER NOT NULL,
        songId INTEGER NOT NULL,
        day DATE NOT NULL,
        playCount INTEGER NOT NULL DEFAULT(0),
        PRIMARY KEY(year, songId, day),
        FOREIGN KEY (songId) REFERENCES song(id)
    );
