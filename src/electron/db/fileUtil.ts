const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
import { Database } from "sqlite3";
import { SemicolonPreference } from "typescript";

export class FileUtil {
    static async scanFiles(): Promise<void> {
        //TODO: replace with the path from the config table
        const libraryPath = 'P:/Music/music/rotation/Abbath';
        const semaphore = new Semaphore(10);
        this.readDirectory(libraryPath, semaphore);
    }

    private static async readDirectory(directoryPath: string, semaphore: Semaphore): Promise<void> {
        console.log(`Reading from directory ${directoryPath}`);
        const files = await fs.promises.readdir(directoryPath);

        files.forEach(async (file) => {
            const filePath = path.join(directoryPath, file);

            fs.stat(filePath, async (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    // If it's a directory, recursively read its contents
                    console.log('Found directory to read:', filePath);
                    this.readDirectory(filePath, semaphore);
                    return;
                }
                else {
                    await semaphore.acquire();
                    try {
                        await this.proccessAudioFile(filePath);
                    } finally {
                        semaphore.release();
                    }
                }
            });

        });
    }

    private static async proccessAudioFile(filePath: string) {
        const metadata = await mm.parseFile(filePath, { duration: true });
        fs.appendFileSync('metadata.log', JSON.stringify(metadata, null, 2));
    }
}

/*
    This semaphore is needed otherwise we will read too many files for node to handle.
*/
class Semaphore {
    private concurrency: number;
    private tasks: (() => void)[];
    private currentCount: number;

    constructor(concurrency: number) {
        this.concurrency = concurrency;
        this.tasks = [];
        this.currentCount = 0;
    }

    acquire(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.tasks.push(resolve);
            this.tryToRun();
        });
    }

    release(): void {
        this.currentCount--;
        this.tryToRun();
    }

    private tryToRun(): void {
        if (this.currentCount < this.concurrency && this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (task) {
                this.currentCount++;
                task();
            }
        }
    }
}
