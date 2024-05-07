--Create job table
CREATE TABLE IF NOT EXISTS job (
    id INTEGER PRIMARY KEY,
    complete INTEGER,
    startDate TEXT DEFAULT CURRENT_TIMESTAMP
);


--Create jobData table
CREATE TABLE IF NOT EXISTS jobData (
    id INTEGER PRIMARY KEY,
    albumName TEXT,
    albumYear INTEGER,
    artistName TEXT,
    genre TEXT,
    songName TEXT,
    songLength INTEGER,
    songPosition INTEGER,
    jobId INTEGER,
    FOREIGN KEY (jobId) REFERENCES job(id)
);
