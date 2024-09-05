const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { DbUtil } from "../../core/db/dbUtil";


const SupportedFileTypesList = ['mp3', 'm4a', 'wav', 'flac']
export type SupportedFileTypes = typeof SupportedFileTypesList[number];
export const fileReadingTempTable = 'temp_read_table';

export class FileUtil {
    static isSupportedFileType(fileType: string): fileType is SupportedFileTypes {
        let val = fileType.replace(/\./g, '');
        return SupportedFileTypesList.indexOf(val as SupportedFileTypes) >= 0;
    }


    static async scanFiles(): Promise<void> {
        //TODO: replace with the path from the config table
        const libraryPath = 'P:/Music/music/rotation';
        const db = new Database(`${process.env.DB_PATH}`, OPEN_CREATE | OPEN_READWRITE, (err: Error | null) => {
            if (err) {
                return console.error(err.message);
            }
        });

        const insertStatements: string[] = [];
        console.log('starting library processing');
        await this.processLibrary(libraryPath, insertStatements);
        console.log('processed, preparing to insert');

        const transaction = `
            CREATE TABLE ${fileReadingTempTable} (
                id INTEGER PRIMARY KEY,
                albumName TEXT,
                albumYear INTEGER,
                artistName TEXT,
                genre TEXT,
                songName TEXT,
                songLength INTEGER,
                songPosition INTEGER,
                songFilePath TEXT
            );

            BEGIN TRANSACTION; ${insertStatements.join("\n")} COMMIT;
        `

        console.log(transaction);
        await DbUtil.execute(db, transaction);
        await this.insertDistinctIntoTable('genre', 'genre', 'name', db);
        await this.insertDistinctIntoTable('artist', 'artistName', 'name', db);
        await this.insertAlbums(db);
        await this.insertSongs(db);
    }

    private static async insertDistinctIntoTable(
        targetTableName: string,
        originColumnName: string,
        targetColumnName: string,
        db: Database): Promise<void> {

        //Insert into the given target table.
        //Uses the temp table and a left join to find insert any records where the origin column in the temp table does not match the target column in the target table
        const insertTransaction = `
            INSERT INTO ${targetTableName} (id, ${targetColumnName})
            SELECT NULL, temp.${originColumnName}
            FROM (
                SELECT DISTINCT ${originColumnName}
                from ${fileReadingTempTable}
            ) AS temp
            LEFT JOIN ${targetTableName} AS targetTable ON temp.${originColumnName} = targetTable.${targetColumnName}
            WHERE targetTable.id IS NULL and temp.${originColumnName} IS NOT NULL
        `
        console.log(insertTransaction);
        return DbUtil.execute(db, insertTransaction);
    }


    private static async insertAlbums(db: Database): Promise<void> {
        const insertTransaction = `
            insert into album (id, name, artistId)
            select null, temp.albumName, temp.artistId
            from (
                select distinct t.albumName, art.id as artistId from ${fileReadingTempTable} as t inner join artist art on t.artistName = art.name
                where t.albumName IS NOT NULL
            ) as temp
            left join album as alb on temp.albumName = alb.name
            where alb.id is null;
        `;
        
        console.log(insertTransaction);
        return DbUtil.execute(db, insertTransaction);
    }

    private static async insertSongs(db: Database): Promise<void> {
        const insertTransaction = `
        insert into song (id, name, albumId, songPosition, songLength, songFilePath)
        select null, temp.songName, temp.albumId, temp.songPosition, temp.songLength, temp.songFilePath
        from (
            select distinct t.songName, alb.id as albumId, t.songPosition, t.songLength, t.songFilePath
            from ${fileReadingTempTable} as t inner join album alb on t.albumName = alb.name
        ) as temp
        left join song as so on temp.songName = so.name
        where so.id is null;
        `;
        
        console.log(insertTransaction);
        return DbUtil.execute(db, insertTransaction);
    }

    private static async processLibrary(directoryPath: string, insertStatements: string[]): Promise<void> {
        let files = await fs.promises.readdir(directoryPath);
        const directories = [];

        for (let file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                directories.push(filePath);
            }
            else {
                await this.proccessAudioFile(filePath, insertStatements)
            }
        }
        files = null;

        for (let dir of directories) {
            await this.processLibrary(dir, insertStatements);
        }
    }

    private static async proccessAudioFile(filePath: string, insertStatements: string[]): Promise<void> {
        if (this.isSupportedFileType(path.extname(filePath))) {
            let metadata = await mm.parseFile(filePath, { duration: true });


            const albumName = this.processString(metadata.common.album);
            const artistName = this.processString(metadata.common.artist);
            const songName = this.processString(metadata.common.title);
            const songPosition = metadata.common.track.no;
            const genre = metadata.common.genre;
            const genreString = this.processString(genre? genre[0]: null);

            const insertStatement = `
                INSERT INTO ${fileReadingTempTable} (albumName, artistName, songName, songPosition, genre, songFilePath) values (
                    ${albumName}, ${artistName}, ${songName}, ${songPosition}, ${genreString}, ${this.processString(filePath)}
                );
            `
            metadata = null;
            insertStatements.push(insertStatement);
        }
    }

    private static processString(str: string) {
        if (!str) {
            return 'NULL';
        }

        //Escape single quotes so we don't break the insert
        const quoteEscaped = str.replace(/['"]/g, match => {
            return match === "'" ? "''" : '\\"';
        })
        return `'${quoteEscaped}'`;
    }

}