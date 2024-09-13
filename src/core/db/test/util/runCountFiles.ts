import { CountFilesInTestLibrary } from "./countFilesInTestLibrary";

CountFilesInTestLibrary.count(process.argv[2]).then((count) => {
    console.log(`Found ${count} supported audio files in ${process.argv[2]}`)
});