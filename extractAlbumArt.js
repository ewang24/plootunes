const fs = require('fs');
const mm = require('music-metadata');
const path = require('path');

export async function extractAlbumArt(filePath, outputDir) {
    try {
        // Parse the metadata of the music file
        const metadata = await mm.parseFile(filePath, { duration: true });

        if (metadata.common.picture && metadata.common.picture.length > 0) {
            // Extract the cover image data
            const imageData = metadata.common.picture[0].data;
            let imageFormat = metadata.common.picture[0].format;

            // Map format to proper file extension
            let formatMap = {
                'jpg': 'jpg',
                'jpeg': 'jpg',
                'png': 'png',
                'gif': 'gif',
                'bmp': 'bmp',
                'tiff': 'tiff'
            };

            imageFormat = formatMap[imageFormat] || 'jpg';
        
            const outputFilePath = path.join(outputDir, `cover_image.${imageFormat}`);

            fs.writeFile(outputFilePath, imageData, (err) => {
                if (err) {
                    console.error('Error writing cover image to file:', err);
                } else {
                    console.log(`Cover image saved as ${outputFilePath}`);
                }
            });
        } else {
            console.log('No cover image found in the file.');
        }
    } catch (error) {
        console.error('Error extracting album art:', error);
    }
}

const musicFilePath = 'P:/Music/music/rotation/Abbath/Abbath_ToWar_886445634129_1_1.mp3';
const outputDirectory = 'P:/Music/music/rotation/Abbath';

extractAlbumArt(musicFilePath, outputDirectory);