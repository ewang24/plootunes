// import { Database, OPEN_READONLY, Statement } from "sqlite3";
import { handler } from "../decorators/handlerDecorator";
import { BaseHandlerService } from "../baseHandlerService";
import { Song } from "../../../../core/db/dbEntities/song";
import { Sqlite3Connector } from "../../../db/sqlite3Connector";
import { SongDto } from "../../../../core/db/dto/songDto";

export class SongService extends BaseHandlerService{

    constructor() {
        super('SongService');
    }

    @handler
    async getSongsByAlbum(albumId: number): Promise<Song[]>{ 
      console.log('hello, reading songs')
      const connector = Sqlite3Connector.getInstance();
      const songDto = new SongDto(connector);
      return songDto.getSongsByAlbum(albumId);
      //   const db = new Database(process.env.DB_PATH, OPEN_READONLY, (err: Error | null) => {
      //     if (err) {
      //       return console.error(err.message);
      //     }
      //     console.log('Connected to the on-disk SQlite database.');
      //   });
    
      //   const query = `
      //     SELECT * FROM song where albumId = ${albumId}
      //   `
    
      //   return this.fetch(db, query);
      // }
    
      // private fetch(db: Database, query: string): Promise<Song[]> {
      //   return new Promise((resolve, reject) => {
      //     db.all(query, function (this: Statement, err: Error | null, rows: Song[]) {
      //       if (err) {
      //         reject(err);
      //       }
    
      //       resolve(rows);
      //     });
      //   })
      }

}