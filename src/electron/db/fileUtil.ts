const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
import { Database } from "sqlite3";

export class FileUtil {
    static createJob(){
        
    }

    static async scanFiles(): Promise<void> {
        //TODO: replace with the path from the config table
        const libraryPath = 'P:/Music/music/rotation';
        const output: string[] = [];
        await this.processLibrary(libraryPath, output);
        console.log(output, output.length);
    }

    private static async processLibrary(directoryPath: string, output: string[]): Promise<void> {
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
                await this.proccessAudioFile(filePath, output)
            }
        }
        files = null;

        for(let dir of directories){
            await this.processLibrary(dir, output);
        }
    }

    private static async proccessAudioFile(filePath: string, output: string[]): Promise<void> {
        if(path.extname(filePath) === '.mp3'){
            let metadata = await mm.parseFile(filePath, { duration: true });
            metadata = null;
            output.push(filePath);    
        }
        
    }
}