import { Song } from "../../../../../core/db/dbEntities/song";
import { Connector } from "../../../../../core/db/dto/connector";
import { QueueDto } from "../../../../../core/db/dto/queueDto";
import { handler } from "../../decorators/handlerDecorator";
const fs = require('fs');

export class QueueService{
    queueDto: QueueDto;

    constructor(connector: Connector){
        this.queueDto = new QueueDto(connector);
    }

    @handler
    async playSong(songId: number){
        await this.queueDto.clearQueue();
        return this.queueDto.queueSong(songId, true);
    }

    @handler
    async queueSong(songId: number): Promise<void>{
        // console.log(`inserting into queue: ${songId}`)
        const queueSize = await this.queueDto.getQueueSize();
        // console.log(`queue size is ${JSON.stringify(queueSize)}. queue record will ${queueSize === 0? "": "not "}be current.`)
        return this.queueDto.queueSong(songId, queueSize === 0);
    }

    @handler
    async getNextSongInQueue(): Promise<Song>{
        return this.queueDto.getNextSongInQueue();
    }

    @handler
    async transitionCurrentSong(nextCurrentSongId: number): Promise<void>{
        return this.queueDto.setSongAsCurrent(nextCurrentSongId);
    }
}