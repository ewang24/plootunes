import { FileUtil } from "../../../electron/util/fileUtil";

const fs = require('fs').promises;
const path = require('path');

export class TestAudioFileGenerator {
    static async generateTestFilesFromExistingLibrary() {
        console.log(`Creating test library with ${process.argv[2]} as the source`);
        this.processLibrary(process.argv[2], process.argv[2], path.resolve(__dirname, "./assets/testLibrary"));
    }

    private static async processLibrary(currentWorkingDirectoryPath: string, sourcePath: string, targetPath: string, baseFileContents?): Promise<void> {
        let _baseFileContents = baseFileContents;
        if(!baseFileContents){
            _baseFileContents = await fs.readFile(path.resolve(__dirname, "./assets/test.mp3"));
        }

        let files
        try{
             files = await fs.readdir(currentWorkingDirectoryPath);
        }
        catch(err){
            console.log(`An error occurred while trying to read files from ${currentWorkingDirectoryPath}: ${JSON.stringify(err)}`)
            return;
        }
        
        const directories = [];

        for (let file of files) {
            const filePath = path.join(currentWorkingDirectoryPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                directories.push(filePath);
            }
            else {
                await this.proccessAudioFile(filePath, sourcePath, targetPath, baseFileContents)
            }
        }
        files = null;

        for (let dir of directories) {
            await this.processLibrary(dir, sourcePath, targetPath, _baseFileContents);
        }
    }

    private static async proccessAudioFile(filePath: string, sourcePath: string, targetPath: string, baseFileContents): Promise<void> {
        if (FileUtil.isSupportedFileType(path.extname(filePath))) {
            const fileName = path.basename(filePath);
            console.log(`found file: ${fileName}`)
            const targetSubDirectory = this.getTargetpathRelativeToSource(filePath, sourcePath, targetPath);
            console.log(targetSubDirectory);
            try{
                await fs.mkdir(targetSubDirectory, {recursive: true});
                console.log(`Created/found directory at ${targetSubDirectory}`);
                const testDataDir = path.join(targetSubDirectory, fileName);
                await fs.writeFile(testDataDir, baseFileContents);
                console.log(`Created test file at ${testDataDir}`);
            }
            catch(err){
                console.log(`An error occurred while trying to create the directory ${targetSubDirectory}: ${JSON.stringify(err)}`)
            }
            

        }
    }

    private static getTargetpathRelativeToSource(filePath: string, sourcePath: string, targetPath: string){
        return path.join(targetPath, path.relative(sourcePath, path.dirname(filePath)));
    }
}

TestAudioFileGenerator.generateTestFilesFromExistingLibrary();