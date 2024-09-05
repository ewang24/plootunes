
import { cached, Database, OPEN_READONLY, Statement } from 'sqlite3';
import {Connector, QueryParam} from '../../core/db/dto/connector'
export class Sqlite3Connector implements Connector{

    private static instance: Sqlite3Connector;
    private db: Database;

    private constructor(){
        this.db = cached.Database(process.env.DB_PATH, OPEN_READONLY, (err: Error | null) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Connected to the on-disk SQlite database.');
          });      
    }

    static getInstance(): Sqlite3Connector{
        if(!Sqlite3Connector.instance){
            Sqlite3Connector.instance = new Sqlite3Connector();
        }

        return Sqlite3Connector.instance;
    }

    get<T>(query: string, params?: QueryParam): Promise<T> {
        throw new Error('Method not implemented.');
    }

    getAll<T>(query: string, params?: QueryParam): Promise<T[]> {
        this.wrapParams(params);
        const selectStatement = this.db.prepare(query, params || {});
        return new Promise((resolve, reject) => {
            selectStatement.all(
              function (this: Statement, err: Error | null, rows: T[]) {
                if (err) {
                  console.error(`An error occurred: ${JSON.stringify(err, null, 2)}`)
                  reject(err);
                }
      
                resolve(rows);
              }
            );
          })
    }

    execute(query: string, params?: QueryParam): void {
        throw new Error('Method not implemented.');
    }

    private wrapParams(params?: QueryParam){
        if(!params){
            return;
        }

        for(let key of Object.keys(params)){
            params[`$${key}`] = params[key];
            delete params[key];
        }
    }
}