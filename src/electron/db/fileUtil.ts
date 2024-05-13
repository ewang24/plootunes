const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { DbUtil } from "./dbUtil";


const SupportedFileTypesList = ['mp3', 'm4a', 'wav', 'flac']
export type SupportedFileTypes = typeof SupportedFileTypesList[number];
export const fileReadingTempTable = 'temp_read_table';

export class FileUtil {
    static isSupportedFileType(fileType: unknown): fileType is SupportedFileTypes {
        return SupportedFileTypesList.indexOf(fileType as SupportedFileTypes) >= 0;
    }


    static async scanFiles(): Promise<void> {
        //TODO: replace with the path from the config table
        const libraryPath = 'P:/Music/music/rotation';
        const db = new Database(`${process.env.DB_PATH}/plootunes.sqlite`, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
            if (err) {
              return console.error(err.message);
            }
          });
        
        const insertStatements: string[] = [];
        console.log('starting library processing');
        await this.processLibrary(libraryPath, insertStatements);
        console.log('processed, preparing to insert');

        const transaction = `
            CREATE TEMPORARY TABLE ${fileReadingTempTable} (
                id INTEGER PRIMARY KEY,
                albumName TEXT,
                albumYear INTEGER,
                artistName TEXT,
                genre TEXT,
                songName TEXT,
                songLength INTEGER,
                songPosition INTEGER
            );

            BEGIN TRANSACTION; ${insertStatements.join("\n")} COMMIT;
        `

        await DbUtil.execute(db, transaction);
    }

    private static async processLibrary(directoryPath: string, insertStatements: string[]): Promise<void> {
        let files = await fs.promises.readdir(directoryPath);
        const directories = [];

        for(let file of files){    
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                directories.push(filePath);
            }
            else{
                await this.proccessAudioFile(filePath, insertStatements)
            }
        }
        files = null;

        for(let dir of directories){
            await this.processLibrary(dir, insertStatements);
        }
    }

    private static async proccessAudioFile(filePath: string, insertStatements: string[]): Promise<void> {
        if(this.isSupportedFileType(path.extname(filePath))){
            let metadata = await mm.parseFile(filePath, { duration: true });

            const albumName = this.processString(metadata.common.album);
            const artistName = this.processString(metadata.common.artist); 
            const songName = this.processString(metadata.common.title);
            const songPosition = metadata.common.track.no;

            const insertStatement = `
                INSERT INTO ${fileReadingTempTable} (albumName, artistName, songName, songPosition) values (
                    '${albumName}', '${artistName}', '${songName}', '${songPosition}'
                );
            `
            metadata = null;
            insertStatements.push(insertStatement);    
        }
    }

    private static processString(str: string) {
        if(!str){
            return null;
        }

        //Escape single quotes so we don't break the insert
        const quoteEscaped = str.replace(/['"]/g, match => {
            return match === "'" ? "''" : '\\"';
        })
        return quoteEscaped;
    }

}