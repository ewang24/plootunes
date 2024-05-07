const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

export class FileUtil {
    static async scanFiles(): Promise<void> {
        //TODO: replace with the path from the config table
        const libraryPath = 'P:/Music/music/rotation';
        // const semaphore = new Semaphore(10);
        const output: string[] = [];
        await this.processLibrary(libraryPath, output);
        console.log(output, output.length);
    }

    private static async processLibrary(directoryPath: string, output: string[]): Promise<void> {
        // console.log(`Reading from directory ${directoryPath}`);
        output.push(directoryPath);
        let files = await fs.promises.readdir(directoryPath);
        const directories = [];

        for(let file of files){    
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                // If it's a directory, recursively read its contents
                // console.log('Found directory to read:', filePath);
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

/*
    This semaphore is needed otherwise we will read too many files for node to handle.
*/
// class Semaphore {
//     private concurrency: number;
//     private tasks: (() => void)[];
//     private currentCount: number;

//     constructor(concurrency: number) {
//         this.concurrency = concurrency;
//         this.tasks = [];
//         this.currentCount = 0;
//     }

//     acquire(): Promise<void> {
//         return new Promise<void>((resolve) => {
//             this.tasks.push(resolve);
//             this.tryToRun();
//         });
//     }
 
//     release(): void {
//         this.currentCount--;
//         this.tryToRun();
//     }

//     private tryToRun(): void {
//         if (this.currentCount < this.concurrency && this.tasks.length > 0) {
//             const task = this.tasks.shift();
//             if (task) {
//                 this.currentCount++;
//                 task();
//             }
//         }
//     }
// }
