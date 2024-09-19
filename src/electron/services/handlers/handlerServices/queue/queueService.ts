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
        const queueSize = await this.queueDto.getQueueSize();
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

    @handler
    async playAlbum(albumId: number): Promise<void>{
        await this.queueDto.clearQueue();
        return this.queueAlbum(albumId, true);
    }

    @handler
    async queueAlbum(albumId: number, setCurrent?: boolean): Promise<void>{
        return this.queueDto.queueAlbum(albumId, setCurrent);
    }

    @handler
    async playArtist(artistId: number): Promise<void>{
        await this.queueDto.clearQueue();
        return this.queueArtist(artistId, true);
    }

    @handler
    async queueArtist(artistId: number, setCurrent?: boolean): Promise<void>{
        return this.queueDto.queueArtist(artistId, setCurrent);       
    }

    @handler
    async queueAllSongsAndPlay(songId: number): Promise<void>{
        await this.queueAllSongs();
        return this.queueDto.setSongAsCurrent(songId);
    }

    @handler
    async queueAllSongs(): Promise<void>{
        return this.queueDto.queueAllSongs();
    }
}