import { LibrarySetupService } from "../../../../electron/services/system/librarySetupService";

const fs = require('fs').promises;
const path = require('path');
export class CountFilesInTestLibrary{
    static async count(librarySource: string): Promise<number>{
        librarySource = path.join(__dirname, librarySource);
        console.log(`Preparing to count files in ${librarySource}`);
        return this.processLibrary(librarySource)
    }

    private static async processLibrary(currentWorkingDirectoryPath: string): Promise<number> {
        let files;
        try {
            files = await fs.readdir(currentWorkingDirectoryPath);
        }
        catch (err) {
            console.log(`An error occurred while trying to read files from ${currentWorkingDirectoryPath}: ${JSON.stringify(err)}`)
            return;
        }

        const directories = [];
        let currentLevelCount = 0;

        for (let file of files) {
            const filePath = path.join(currentWorkingDirectoryPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                directories.push(filePath);
            }
            else {
                currentLevelCount += this.proccessAudioFile(filePath)
            }
        }
        files = null;

        for (let dir of directories) {
            currentLevelCount += await this.processLibrary(dir);
        }

        return currentLevelCount;
    }

    private static proccessAudioFile(filePath: string): number {
        if (LibrarySetupService.isSupportedFileType(path.extname(filePath))) {
            return 1;
        }

        return 0;
    }
}

