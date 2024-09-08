import { QueueRecord } from "../dbEntities/queueRecord";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class QueueDto{
    queries: Queries = {
        getCurrentSong: "SELECT * FROM queue WHERE current = 1",
        getFirstSong: "SELECT * FROM queue LIMIT 1",
        queueSong: "INSERT INTO queue (songId, position, current) VALUES ($songId, 0, 0)"
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async getFirstSong(): Promise<QueueRecord>{
        return this.connector.get<QueueRecord>(this.queries.getFirstSong);
    }

    async getCurrentSong(): Promise<QueueRecord>{
        return this.connector.get<QueueRecord>(this.queries.getCurrentSong);
    }

    async queueSong(songId: number): Promise<void>{
        return this.connector.execute(this.queries.queueSong.replace('$songId', `${songId}`), {songId});
    }
}