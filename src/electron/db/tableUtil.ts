const fs = require('fs');
const path = require('path');
import { Database } from "sqlite3";

export class TableUtil {

    static async createAllTables(db: Database){
        const schemaDirectory = "./db/schemas";
        fs.readdir(schemaDirectory, (err, files) =>{
            if(err){
                console.error(`error reading schema for files at ${schemaDirectory}: ${err}`);
            }

            files.forEach(file => {
                const filePath = path.join(schemaDirectory, file);
                fs.readFile(filePath, 'utf8', (err, schema) => {
                    if(err){
                        console.error(`error reading schema at ${filePath}: ${err}`);
                    }

                    if(!schema){
                        console.error(`No schema present at ${filePath}. Empty file!`);
                    }

                    db.run(schema, (err: Error | null) => {
                        if (err) {
                          return console.error(err.message);
                        }
                        console.log(`Processed schema at ${filePath} table.`);
                      });
                })
            })
        });
    }

}