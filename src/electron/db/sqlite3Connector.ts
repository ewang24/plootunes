
import { Database, Statement } from 'sqlite3';
import { Connector, QueryParam } from '../../core/db/dto/connector'
export class Sqlite3Connector implements Connector {

  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Run a query that is expected to return a single record, of a shape that matches T.
   * @param query The query to run. If the query has any placholder parameters, they should be specified like this in the query string: $variableName
   * @param params The parameters to insert into place holders.
   *               The parameters must be literal values, E.G. you cannot do this: SELECT COUNT(*) AS count FROM $tableName 
   *               because it will insert the table name as a string literal.
   * @returns A single record of type T
   */
  get<T>(query: string, params?: QueryParam): Promise<T> {
    if (!query) {
      throw new Error("No query specified!");
    }

    this.wrapParams(params);
    console.log(query, ",", JSON.stringify(params));
    const selectStatement = this.db.prepare(query, params || {});
    return new Promise((resolve, reject) => {
      selectStatement.get(
        function (this: Statement, err: Error | null, record: T) {
          if (err) {
            console.error(`An error occurred: ${JSON.stringify(err, null, 2)}`)
            reject(err);
          }

          selectStatement.finalize();
          resolve(record);
        }
      );
    });
  }

  getAll<T>(query: string, params?: QueryParam): Promise<T[]> {
    if (!query) {
      throw new Error("No query specified!");
    }

    this.wrapParams(params);
    const selectStatement = this.db.prepare(query, params || {});
    return new Promise((resolve, reject) => {
      selectStatement.all(
        function (this: Statement, err: Error | null, rows) {
          if (err) {
            console.error(`An error occurred: ${JSON.stringify(err, null, 2)}`)
            reject(err);
          }

          selectStatement.finalize();
          resolve(rows as T[]);
        }
      );
    })
  }

  run(query: string, params?: QueryParam): Promise<void> {
    if(!query){
      throw new Error("No query specified!");
    }

    this.wrapParams(params);
    console.log(`executing query: ${query}. Optionally, with params: ${JSON.stringify(params)}`)
    return new Promise<void>((resolve, reject: (error?: Error) => void) => {
      this.db.run(query, params, (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private wrapParams(params?: QueryParam) {
    if (!params) {
      return;
    }

    for (let key of Object.keys(params)) {
      params[`$${key}`] = params[key];
      delete params[key];
    }
  }
}