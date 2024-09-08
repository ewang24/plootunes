import { cached, OPEN_CREATE, OPEN_READONLY, OPEN_READWRITE } from "sqlite3";
import { Sqlite3Connector } from "./sqlite3Connector";

export class ConnectorFactory{

    static db;

    constructor(){

    }

    createConnector(write?: boolean){

        if(!ConnectorFactory.db){
          // const mode = write? OPEN_READWRITE: OPEN_READONLY;
          ConnectorFactory.db = cached.Database(process.env.DB_PATH, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
              if (err) {
                return console.error(err.message);
              }
              console.log(`Handler connected to the on-disk SQlite database with ${OPEN_READWRITE}.`);
            });   
        }
        
        return new Sqlite3Connector(ConnectorFactory.db);
    }

}