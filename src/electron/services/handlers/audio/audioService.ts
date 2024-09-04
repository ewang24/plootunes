import { BaseHandlerService } from "../baseHandlerService";
import { handler } from "../decorators/handlerDecorator";
import * as fs from 'fs';
export class AudioService extends BaseHandlerService {

    constructor() {
        super('AudioService');
    }

    @handler
    async getAudioFileData(): Promise<Buffer>{
        const path = 'P:/Music/music/rotation/Theocracy/Mirror of Souls/01-03- Laying The Demon To Rest.mp3';
        // const path = 'P:/Music/music/rotation/Theocracy/Mirror of Souls/01-08- Mirror Of Souls.mp3';
        const audioData = fs.readFileSync(path);
        return audioData;
    }
}