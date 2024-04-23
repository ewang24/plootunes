import { Database, OPEN_READONLY, Statement } from "sqlite3";
import { BaseHandlerService } from "../baseHandlerService";
import { handler } from "../decorators/handlerDecorator";
import { Album } from "../../../../../global/dbEntities/album";

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

    const query = `
          SELECT * FROM album 
        `

    return this.fetch(db, query);
  }

  private fetch(db: Database, query: string): Promise<Album[]> {
    return new Promise((resolve, reject) => {
      db.all(
        query,
        function (this: Statement, err: Error | null, rows: Album[]) {
          if (err) {
            reject(err);
          }

          resolve(rows);
        }
      );
    })
  }
}