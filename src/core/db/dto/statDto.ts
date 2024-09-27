import { Connector } from "./connector";
import { Queries } from "./queries";

export class StatDto{
    
    queries: Queries = {
        addSongPlay: `
            INSERT INTO songStat (year, songId, day, playCount)
            VALUES ($year, $songId, $day, 1)
            ON CONFLICT(year, songId, day)
            DO UPDATE SET playCount = playCount + 1;
        `
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async addSongPlay(songId: number): Promise<void>{
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const day = currentDate.toISOString().split('T')[0];
        return this.connector.run(this.queries.addSongPlay, {year, day, songId})
    }

}