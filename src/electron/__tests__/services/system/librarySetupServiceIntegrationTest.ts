import { existsSync, unlinkSync } from "fs";
import { CreateTestDb } from "../../../../core/db/test/util/createTestDb";
import path = require("path");
import { CountFilesInTestLibrary } from "../../../../core/db/test/util/countFilesInTestLibrary";
import { Database, OPEN_READWRITE } from "sqlite3";
import { Sqlite3Connector } from "../../../db/sqlite3Connector";
import { Connector } from "../../../../core/db/dto/connector";
import { Album } from "../../../../core/db/dbEntities/album";
import { Song } from "../../../../core/db/dbEntities/song";
import { AlbumDto } from "../../../../core/db/dto/albumDto";
import { Artist } from "../../../../core/db/dbEntities/artist";
import exp = require("constants");

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
        throw new Error(`Failed to delete pre-existing database file: ${err.message}`);
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
      console.log(`Actual number of files found in dir: ${countOfFiles}`);
      const dbRecordCount = (await connector.get<number>(`SELECT COUNT(*) FROM song`))["COUNT(*)"];
      expect(dbRecordCount).toEqual(countOfFiles);
    });

    test("No duplicated songs", async () => {
      const query = `
        SELECT name, COUNT(*) FROM song
        GROUP BY name, songFilePath
        HAVING COUNT(*) > 1;
      `;

      const duplicatedSongsCount = await connector.getAll<number>(query);
      expect(duplicatedSongsCount.length).toEqual(0);
    })

    test("Albums with the same names but different artists create multiple albums", async () => {
      //This album has 1 song with a different artist. It should have therefore created two albums, one for each artist.
      const query = `
        SELECT * FROM album WHERE name = "Blackbraid II";
      `
      const albums = await connector.getAll<Album>(query);
      expect(albums.length).toEqual(2);
    });

    test("Albums with the same names but different artists should not duplicate songs", async () => {
      //Same album as above. Make sure that none of the songs between albums are shared. There used to be a bug where it would duplicate all the songs between albums.
      const query = `
        SELECT * FROM album WHERE name = "Blackbraid II";
      `
      const albums = await connector.getAll<Album>(query);
      const albumId1 = albums[0].id;
      const albumId2 = albums[1].id;

      const songsQuery = `SELECT * FROM song where albumId = $albumId`;

      const [songs1, songs2] = await Promise.all([
        connector.getAll<Song>(songsQuery, { albumId: albumId1 }),
        connector.getAll<Song>(songsQuery, { albumId: albumId2 })
      ])

      expect(songs1.length).not.toEqual(songs2.length);

      for (let song of songs1) {
        expect(songs2.some((_song) => _song.name === song.name)).toBeFalsy();
      }
    });

    test("Songs with no album cause an 'Unknown Album' album to be created for their artist", async () => {
      const fakerArtistQuery = `
        SELECT * FROM artist WHERE name = "Faker";
      `
      const unknownAlbumQuery = `
        SELECT * FROM album WHERE name = "Unknown Album" and artistId = $artistId;
      `

      const fakerArtist = await connector.get<Artist>(fakerArtistQuery);
      console.log(`faker: ${fakerArtist.id}`)
      const unknownAlbum = await connector.get<Album>(unknownAlbumQuery, {artistId: fakerArtist.id});
      expect(unknownAlbum).not.toBeUndefined();
      expect(unknownAlbum.name).toEqual("Unknown Album");
    });

    test("Songs with no album are put into the 'Unknown Album' album for their artist", async () => {
      const fakerArtistQuery = `
        SELECT * FROM artist WHERE name = "Faker";
      `
      const unknownAlbumQuery = `
        SELECT * FROM album WHERE name = "Unknown Album" and artistId = $artistId;
      `

      const unknownArtist = await connector.get<Artist>(fakerArtistQuery);
      const unknownAlbum = await connector.get<Album>(unknownAlbumQuery, {artistId: unknownArtist.id});
      expect(unknownAlbum).not.toBeUndefined();

      const unknownAlbumId = unknownAlbum.id;
      const unknownAlbumSongsQuery = `
        SELECT * FROM song WHERE albumId = $unknownAlbumId;
      `;

      const songs = await connector.getAll<Song>(unknownAlbumSongsQuery, { unknownAlbumId });
      console.log(JSON.stringify(songs, null, 2));
      expect(songs.length).toEqual(1);
      const song = songs[0];
      expect(song.name).toEqual("song with no album");
    });

    test("Songs with no artist cause an 'Unknown Artist' artist to be created", async () => {
      const unknownArtistQuery = `
        SELECT * FROM artist WHERE name = "Unknown Artist";
      `

      const unknownArtist = await connector.get<Artist>(unknownArtistQuery);
      expect(unknownArtist).not.toBeUndefined();
      expect(unknownArtist.name).toEqual("Unknown Artist");
    });

    test("Songs with no artist do not cause more than 1 'Unknown Artist' artist to be created", async () => {
      const unknownArtistQuery = `
        SELECT * FROM artist WHERE name = "Unknown Artist";
      `

      const unknownArtist = await connector.getAll<Artist>(unknownArtistQuery);
      expect(unknownArtist).not.toBeUndefined();
      expect(unknownArtist.length).toEqual(1);
    });

    test("Songs with no artist are assigned to the 'Unknown Artist' artist", async () => {
      const unknownArtistQuery = `
        SELECT * FROM artist WHERE name = "Unknown Artist";
      `

      const unknownArtist = await connector.get<Artist>(unknownArtistQuery);
      const unknownArtistAlbumQuery = `
        SELECT * FROM album WHERE artistId = $artistId and name = "Faker"
      `
      const unknownArtistFakerAlbum = await connector.get<Album>(unknownArtistAlbumQuery, {artistId: unknownArtist.id});
      const unknownArtistSongQuery = `
        SELECT * FROM song WHERE albumId = $albumId
      `
      
      const songs = await connector.getAll<Song>(unknownArtistSongQuery, {albumId: unknownArtistFakerAlbum.id});
      expect(songs).not.toBeUndefined();
      expect(songs.length).toEqual(1);
      const song = songs[0];
      expect(song.name).toEqual("song with no artist");

    });

    test("Songs with no artist and no album are assigned to the 'Unknown Artist' artist with the 'Unknown Album' album", async () => {
      const unknownArtistQuery = `
        SELECT * FROM artist WHERE name = "Unknown Artist";
      `

      const unknownArtist = await connector.get<Artist>(unknownArtistQuery);
      const unknownArtistAlbumQuery = `
        SELECT * FROM album WHERE artistId = $artistId and name = "Unknown Album"
      `
      const unknownArtistFakerAlbum = await connector.get<Album>(unknownArtistAlbumQuery, {artistId: unknownArtist.id});
      const unknownArtistSongQuery = `
        SELECT * FROM song WHERE albumId = $albumId
      `
      
      const songs = await connector.getAll<Song>(unknownArtistSongQuery, {albumId: unknownArtistFakerAlbum.id});
      expect(songs).not.toBeUndefined();
      expect(songs.length).toEqual(1);
      const song = songs[0];
      expect(song.name).toEqual("song with no artist or album");

    });
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