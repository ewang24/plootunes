import { cached, OPEN_READONLY } from "sqlite3";
import { Sqlite3Connector } from "./sqlite3Connector";

export class ConnectorFactory{

    constructor(){

    }

    createConnector(){
        const db = cached.Database(process.env.DB_PATH, OPEN_READONLY, (err: Error | null) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Connected to the on-disk SQlite database.');
          });   
        return new Sqlite3Connector(db);
    }

}