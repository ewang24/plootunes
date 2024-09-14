import { Database } from "sqlite3";

export class DbUtil {
    static async execute(db: Database, statement: string): Promise<void> {
        return new Promise<void>((resolve, reject: (error?: Error) => void) => {
            db.exec(statement, (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    static async run(db: Database, statement: string, params): Promise<void> {
        return new Promise<void>((resolve, reject: (error?: Error) => void) => {
            db.run(statement, params, (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    static async get(): Promise<void> {

    }

    static async getAll(): Promise<void> {

    }

    static async insert(db: Database, insertStatement: string): Promise<void>{
        return this.execute(db, insertStatement);
    }

    static async close(db: Database): Promise<void>{
        return new Promise((resolve, reject) => {
            db.close((err) => {
              if(err){
                console.log(`An error ocurred when trying to close the test database: ${JSON.stringify(err, null, 2)}`)
                reject();
              }
      
              resolve();
            })
          });
    }
}