const fs = require('fs');
const path = require('path');
import { Database } from "sqlite3";
import { DbUtil } from "./dbUtil";

export class TableUtil {

    static async createAllTables(db: Database) {
        const schemaDirectory = "./db/schemas/tables";

        fs.readdir(schemaDirectory, (err, files) => {
            if (err) {
                console.error(`error reading schema for files at ${schemaDirectory}: ${err}`);
            }

            files.forEach(file => {
                const filePath = path.join(schemaDirectory, file);
                fs.readFile(filePath, 'utf8', async (err, schemasData) => {
                    if (err) {
                        console.error(`error reading schema at ${filePath}: ${JSON.stringify(err)}`);
                    }

                    if (!schemasData) {
                        console.error(`No schema(s) present at ${filePath}. Empty file!`);
                    }

                    const schemas = schemasData.split(';');

                    for (let schema of schemas) {
                        try {
                            await DbUtil.execute(db, schema);
                        }
                        catch (err) {
                            const firstLine = schema.substring(0, 100);
                            const errMessage = JSON.stringify(err.message);
                            const totalMessage = `Error for schema file ${JSON.stringify(filePath)} in statement starting with \n\t${JSON.stringify(firstLine)}...\nERROR: ${JSON.stringify(errMessage)}`;
                            console.log(totalMessage);
                        }
                    }

                });
            })
        });
    }
}