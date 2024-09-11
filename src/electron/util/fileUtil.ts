const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { DbUtil } from "../../core/db/dbUtil";


/*
 * This functionality uses the music-metadata library. Documentation is here: https://www.npmjs.com/package/music-metadata
   IAudioMetadata is the interface that defines the shape of the metadata returned. 
 */

const SupportedFileTypesList = ['mp3', 'm4a', 'wav', 'flac']
export type SupportedFileTypes = typeof SupportedFileTypesList[number];
export const fileReadingTempTable = 'temp_read_table';
let albumCovers: Record<string, Buffer> = {};


export class FileUtil {
    static isSupportedFileType(fileType: string): fileType is SupportedFileTypes {
        let val = fileType.replace(/\./g, '');
        return SupportedFileTypesList.indexOf(val as SupportedFileTypes) >= 0;
    }

    static async scanFiles(): Promise<void> {
        albumCovers = {};
        //TODO: replace with the path from the config table
        // const libraryPath = 'P:/Music/music/rotation/Amorphis';
        const libraryPath = 'P:/Music/music/rotation/Abbath';
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
        await DbUtil.execute(db, `DROP TABLE ${fileReadingTempTable}`);
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
        await DbUtil.execute(db, insertTransaction);
        
        console.log('buffer info:')
        console.log(Object.keys(albumCovers));
        console.log(albumCovers['Abbath'].toString('hex'));
        console.log(Buffer.isBuffer(albumCovers['Abbath'])); // Should be true
        const sql = `UPDATE album SET coverImage = ? WHERE name = ?`;
        db.run(sql, [albumCovers['Abbath'], 'Abbath'], function(err) {
            if (err) {
                console.error('Error updating cover image:', err.message);
            } else {
                // console.log(`Updated cover image for ${albumName}`);
            }
        });
        // const statement = db.prepare(`UPDATE album SET coverImage = X'48656c6c6f' WHERE name = $albumName;`);
        // for(let album of Object.keys(albumCovers)){
        //     console.log(`preparing: cover art for ${album}.`)
        //     await this.runStatement(statement, {
        //       $albumName: album,
        //     //   $blobData: Buffer.from('test')
        //     });
        //     console.log(`Updated album art for ${album}`)
        // }

        // statement.finalize();
    }

    private static async runStatement(statement, params) {
        return new Promise((resolve, reject) => {
            statement.run(params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes); // 'this' refers to the run context (SQLite statement)
                }
            });
        });
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
            const _genre = metadata.common.genre;
            const genre = this.processString(_genre? _genre[0]: null);
            const length = Math.floor(metadata.format.duration);
            const insertStatement = `
                INSERT INTO ${fileReadingTempTable} (albumName, artistName, songName, songPosition, genre, songFilePath, songLength) values (
                    ${albumName}, ${artistName}, ${songName}, ${songPosition}, ${genre}, ${this.processString(filePath)}, ${length}
                );
            `

            console.log(`recording art for :${albumName}, ${this.quoteEscape(metadata.common.album)}`)
            //TODO: [0] is the first album cover. If there are more embedded, we will not pick up on them. Perhaps need to suppor that in the future.
            albumCovers[this.quoteEscape(metadata.common.album)] = albumCovers[this.quoteEscape(metadata.common.album)] || metadata.common.picture[0].data;

            metadata = null;
            insertStatements.push(insertStatement);
        }
    }

    private static quoteEscape(str: string){
        //Escape single quotes so we don't break the insert
        const quoteEscaped = str.replace(/['"]/g, match => {
            return match === "'" ? "''" : '\\"';
        })

        return quoteEscaped;
    }

    private static processString(str: string) {
        if (!str) {
            return 'NULL';
        }
        
        return `'${this.quoteEscape(str)}'`;
    }

}