const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
import { Data } from "electron";
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { DbUtil } from "./dbUtil";

export class FileUtil {
    static createJob(){

    }

    static async scanFiles(): Promise<void> {
        //TODO: replace with the path from the config table
        const libraryPath = 'P:/Music/music/rotation';
        const output: string[] = [];
        const db = new Database('P:/Documents/GitHub/psychic-octo-rotary-phone/plootunes.sqlite', OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
            if (err) {
              return console.error(err.message);
            }
          });
        
        await this.processLibrary(libraryPath, output, db);
        console.log(output, output.length);
    }

    private static async processLibrary(directoryPath: string, output: string[], db: Database): Promise<void> {
        output.push(directoryPath);
        let files = await fs.promises.readdir(directoryPath);
        const directories = [];

        for(let file of files){    
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                directories.push(filePath);
            }
            else{
                await this.proccessAudioFile(filePath, output, db)
            }
        }
        files = null;

        for(let dir of directories){
            await this.processLibrary(dir, output, db);
        }
    }

    private static async proccessAudioFile(filePath: string, output: string[], db: Database): Promise<void> {
        if(path.extname(filePath) === '.mp3'){
            let metadata = await mm.parseFile(filePath, { duration: true });
            const insertStatement = `
                INSERT INTO jobData (albumName, artistName, songName, songPosition) values (
                    '${this.processString(metadata.common.album)}', '${this.processString(metadata.common.artist)}', '${this.processString(metadata.common.title)}', '${metadata.common.track}'
                )
                `

            console.log(insertStatement)
            metadata = null;
            await DbUtil.insert(db, insertStatement);
            output.push(filePath);    
        }
    }

    private static processString(str: string) {
        if(!str){
            return null;
        }
        const quoteEscaped = str.replace(/['"]/g, match => {
            // Use a conditional (ternary) operator to escape the matched character
            return match === "'" ? "''" : '\\"';
        })
        return quoteEscaped;
    }
}