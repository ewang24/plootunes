//https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/sqlite.mdx

import * as SQLite from 'expo-sqlite';
import { Connector, QueryParam } from '../../../core/db/dto/connector';

export class ExpoSqliteConnector implements Connector {

    db: SQLite.SQLiteDatabase;

    constructor(db: SQLite.SQLiteDatabase){
        this.db = db;
    }

    // async test(){
        // const db = await SQLite.openDatabaseAsync('databaseName');
    // }

    get<T>(query: string, params?: QueryParam): Promise<T> {
        throw new Error("Method not implemented.");
    }

    getAll<T>(query: string, params?: QueryParam): Promise<T[]> {
        this.wrapParams(params || {});
        return this.db.getAllAsync<T>(query, params);
    }

    run(query: string, params?: QueryParam): void {
        throw new Error("Method not implemented.");
    }

    close(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private wrapParams(params?: QueryParam) {
        if (!params) {
          return {};
        }
    
        for (let key of Object.keys(params)) {
          params[`$${key}`] = params[key];
          delete params[key];
        }
      }
}