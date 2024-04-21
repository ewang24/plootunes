// import { Database, OPEN_READONLY, Statement } from "sqlite3";
// import { handler } from "../decorators/handlerDecorator";

// export class SongService{

//     @handler
//     async fetchSongs(): Promise<string>{ 
//         const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_READONLY, (err: Error | null) => {
//           if (err) {
//             return console.error(err.message);
//           }
//           console.log('Connected to the on-disk SQlite database.');
//         });
    
//         const query = `
//           SELECT * FROM song 
//         `
    
//         return this.fetch(db, query);
//       }
    
//       private fetch(db: Database, query: string): Promise<string> {
//         return new Promise((resolve, reject) => {
//           db.all(query, function (this: Statement, err: Error | null, rows: []) {
//             if (err) {
//               reject(err);
//             }
    
//             resolve(JSON.stringify(rows));
//           });
//         })
//       }

// }