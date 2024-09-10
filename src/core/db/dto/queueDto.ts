import { QueueRecord } from "../dbEntities/queueRecord";
import { Song } from "../dbEntities/song";
import { Connector } from "./connector";
import { Dto } from "./dto";
import { Queries } from "./queries";

export class QueueDto extends Dto{
    queries: Queries = {
        getCurrentSong: "SELECT * FROM queue WHERE current = 1",
        getFirstSong: "SELECT * FROM queue LIMIT 1",
        queueSong: "INSERT INTO queue (songId, current, position) VALUES ($songId, $current, 0)",
        clearQueue: "DELETE FROM queue",
        getNextSongInQueue: "SELECT * FROM song WHERE id = (SELECT songId from queue WHERE id > (SELECT id FROM queue where current = 1))",
        setCurrentSongToNotCurrent: "UPDATE queue SET current = 0 where id = (SELECT id FROM queue where current = 1)",
        setSongToCurrent: "UPDATE queue SET current = 1 where id = $songId"
    }

    constructor(connector: Connector){
        super(connector);
    }

    async getFirstSong(): Promise<QueueRecord>{
        return this.connector.get<QueueRecord>(this.queries.getFirstSong);
    }

    async getCurrentSong(): Promise<QueueRecord>{
        return this.connector.get<QueueRecord>(this.queries.getCurrentSong);
    }

    async queueSong(songId: number, current?: boolean): Promise<void>{
        const currentBit = (current? current: false)? 1: 0; 
        console.log(`current: ${currentBit}`);
        return this.connector.run(this.queries.queueSong, {songId, current: currentBit});
    }

    async clearQueue(): Promise<void>{
        return this.connector.run(this.queries.clearQueue);
    }

    async getNextSongInQueue(): Promise<Song>{
        const song = await this.connector.get<Song>(this.queries.getNextSongInQueue);
        console.log(`The next song in the queue is: ${JSON.stringify(song)}`)
        return song;
    }

    async getQueueSize(): Promise<number>{
        return super.count('queue');
    }

    async setSongAsCurrent(songId: number): Promise<void>{
        //TODO: wrap these two queries in a transaction
        await this.connector.run(this.queries.setCurrentSongToNotCurrent);
        return this.connector.run(this.queries.setSongToCurrent, {songId})
    }
}