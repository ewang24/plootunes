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

    static async get(): Promise<void> {

    }

    static async getAll(): Promise<void> {

    }

    static async insert(db: Database, insertStatement: string): Promise<void>{
        return this.execute(db, insertStatement);
    }
}