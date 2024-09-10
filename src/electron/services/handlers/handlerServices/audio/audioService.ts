import { Connector } from "../../../../../core/db/dto/connector";
import { SongDto } from "../../../../../core/db/dto/songDto";
import { handler } from "../../decorators/handlerDecorator";
import * as fs from 'fs';
export class AudioService {

    songDto: SongDto;

    constructor(connector: Connector){
        this.songDto = new SongDto(connector);
    }

    @handler
    async getQueuedSongToPlay(): Promise<Buffer>{
        const audioData = fs.readFileSync("");
        return audioData;
    }

    @handler
    async getSongBuffer(songId: number): Promise<Buffer>{
        console.log(`looking up song ${songId}`)
        const song = await this.songDto.getSong(songId);
        const audioData = fs.readFileSync(song.songFilePath);
        return audioData;
    }
}