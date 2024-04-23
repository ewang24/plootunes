import { Database, OPEN_READONLY, Statement } from "sqlite3";
import { BaseHandlerService } from "../baseHandlerService";
import { handler } from "../decorators/handlerDecorator";
import { Album } from "../../../../../global/dbEntities/album";
import { Artist } from "../../../../../global/dbEntities/artist";

export class AlbumService extends BaseHandlerService {
  constructor() {
    super('AlbumService');
  }

  @handler
  async fetchAlbums(): Promise<Album[]> {
    const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_READONLY, (err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the on-disk SQlite database.');
    });

    const albumQuery = `
          SELECT * FROM album 
        `

    const artistQuery = `
        SELECT * FROM artist 
    `

    const [albums, artists]: [Album[], Artist[]] = await Promise.all([this.fetch<Album>(db, albumQuery), this.fetch<Artist>(db, artistQuery)]);

    const artistMap: {[key: number]: string} = {};
    for (const album of albums) {
        if(!artistMap[album.artistId]) {
          const artist = artists.find((value) => value.id === album.artistId);
          artistMap[album.artistId] = artist? artist.name: 'unknown';
        }

        album.artistName = artistMap[album.artistId];
    }

    return albums;
  }

  private fetch<T>(db: Database, query: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.all(
        query,
        function (this: Statement, err: Error | null, rows: T[]) {
          if (err) {
            reject(err);
          }

          resolve(rows);
        }
      );
    })
  }
}