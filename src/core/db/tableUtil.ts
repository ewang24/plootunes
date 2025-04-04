const fs = require('fs');
const path = require('path');
import { Database } from "sqlite3";
import { DbUtil } from "./dbUtil";

export class TableUtil {

    static async createAllTables(db: Database): Promise<void> {
        const schemaDirectory = path.resolve(__dirname, "./schemas/tables");

        let files;
        try{
            files = await fs.promises.readdir(schemaDirectory);
        }
        catch(err){
            console.error(`Error reading contents of schema directory at ${schemaDirectory}: ${JSON.stringify(err)}`)
        }
         

        for (let file of files) {
            const filePath = path.join(schemaDirectory, file);
            let schemasData;
            try{
                 schemasData = await fs.promises.readFile(filePath, 'utf8');
            }
            catch(err){
                console.error(`Error reading schema file from ${filePath}: ${JSON.stringify(err)}`)
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
        }
    }
}