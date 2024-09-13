import { FileUtil } from "../../../electron/util/fileUtil";

const fs = require('fs').promises;
const path = require('path');
const mm = require('music-metadata');
const NodeID3 = require('node-id3');

/*
    This is a util class to generate a fake library based off a real library. You can provide it the path to a directory with audio files in it.
    It will then iterate through all directories and mimic the directory structure under ./test/assets/testLibrary.
    It will create a 'fake' audio file (a 1 second mp3) with the same names as the audio files from the real directory.
    It won't copy file types though, so if one was an m4a, it will not preserve that.
    It will also copy over the metadata to the test file (album, artist, song name, etc.) which is the real value.
    That way, unit tests can run on some actual audio files with a known structure.
*/
export class TestAudioFileGenerator {
    static async generateTestFilesFromExistingLibrary() {
        console.log(`Creating test library with ${process.argv[2]} as the source`);
        this.processLibrary(process.argv[2], process.argv[2], path.resolve(__dirname, "./assets/testLibrary"));
    }

    private static async processLibrary(currentWorkingDirectoryPath: string, sourcePath: string, targetPath: string, baseFileContents?): Promise<void> {
        let _baseFileContents = baseFileContents;
        if (!baseFileContents) {
            _baseFileContents = await fs.readFile(path.resolve(__dirname, "./assets/test.mp3"));
        }

        let files
        try {
            files = await fs.readdir(currentWorkingDirectoryPath);
        }
        catch (err) {
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
            try {
                await fs.mkdir(targetSubDirectory, { recursive: true });
                console.log(`Created/found directory at ${targetSubDirectory}`);
                const testDataFilePath = path.join(targetSubDirectory, fileName);
                await fs.writeFile(testDataFilePath, baseFileContents);
                console.log(`Created test file at ${testDataFilePath}`);
                await this.updateMetadata(filePath, testDataFilePath)
            }
            catch (err) {
                console.log(`An error occurred while trying to create the directory ${targetSubDirectory}: ${JSON.stringify(err)}`)
            }


        }
    }

    private static getTargetpathRelativeToSource(filePath: string, sourcePath: string, targetPath: string) {
        return path.join(targetPath, path.relative(sourcePath, path.dirname(filePath)));
    }

    private static async updateMetadata(srcAudioFilePath: string, targetAudioFilePath: string) {

        //Read metadata of src audio file
        //Don't care about length here. They're all 1 second long.
        //todo: This might be a good idea to refactor at some point so it's shared code with FileUtil.
        //That way if I change which metadata is read or add more, this test will automatically account for that and I can regenerate the test library.
        let metadata = await mm.parseFile(srcAudioFilePath);
        const albumName = metadata.common?.album;
        const artistName = metadata.common?.artist;
        const songName = metadata.common?.title;
        const songPosition = metadata.common?.track?.no || 0;
        const _genre = metadata.common.genre;
        const genre = _genre ? _genre[0] : undefined;

        //Supported tags: https://www.npmjs.com/package/node-id3
        const tags = {
            title: songName,
            artist: artistName,
            album: albumName,
            trackNumber: songPosition,
            genre: genre
        }

        NodeID3.write(tags, targetAudioFilePath);
    }
}

TestAudioFileGenerator.generateTestFilesFromExistingLibrary();