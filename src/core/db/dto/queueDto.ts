import { QueueRecord } from "../dbEntities/queueRecord";
import { Song } from "../dbEntities/song";
import { Connector } from "./connector";
import { Dto } from "./dto";
import { Queries } from "./queries";

export class QueueDto extends Dto {
    queries: Queries = {
        getCurrentSong: "SELECT * FROM queue WHERE current = 1",
        getFirstSong: "SELECT s.* FROM song s INNER JOIN queue q on s.id = q.songId ORDER BY q.id",
        getFirstShuffledSong: "SELECT s.* FROM song s INNER JOIN queue q on s.id = q.songId ORDER BY randomKey LIMIT 1",
        queueSong: "INSERT INTO queue (songId, current, position) VALUES ($songId, $current, 0)",
        clearQueue: "DELETE FROM queue",
        getNextSongInQueue: "SELECT * FROM song WHERE id = (SELECT songId from queue WHERE id > (SELECT id FROM queue where current = 1))",
        getNextSongInShuffledQueue: `
           SELECT s.* FROM song s INNER JOIN queue q ON s.id = q.songId
           WHERE q.randomKey > (SELECT _q.randomKey FROM queue _q WHERE current = 1)
           ORDER BY q.randomKey
           LIMIT 1;
        `,
        setCurrentSongToNotCurrent: "UPDATE queue SET current = 0 where id = (SELECT id FROM queue where current = 1)",
        setSongToCurrent: "UPDATE queue SET current = 1 where songId = $songId",
        queueAlbum: `
            INSERT INTO queue (songId, current, position)
            SELECT id as songId, 
                CASE
                   WHEN $setCurrent = 1 AND ROW_NUMBER() OVER (ORDER BY songPosition) = 1 THEN 1
                   ELSE 0
                END AS current,
             0 AS position FROM
            song where albumId = $albumId ORDER BY songPosition;
        `,
        queueArtist: `
         INSERT INTO queue (songId, current, position)
            SELECT s.id as songId, 
                CASE
                   WHEN $setCurrent = 1 AND ROW_NUMBER() OVER () = 1 THEN 1
                   ELSE 0
                END AS current,
             0 AS position FROM
            song s inner join album alb on s.albumId = alb.id
                inner join artist art on alb.artistId = art.id
                where art.id = $artistId
                order by s.songPosition;
        `,
        queueAllSongs: `
            INSERT INTO queue (songId, current, position)
            SELECT id, 0, 0 FROM song ORDER BY name
        `,
        moveCurrentSongToShuffledQueueStart: `UPDATE queue SET randomKey = (SELECT MIN(randomKey) - 1 as keyMin FROM queue) WHERE current = 1`,
        setFirstShuffledSongCurrent: `UPDATE queue SET current = 1 WHERE id = (SELECT _q.id FROM queue _q ORDER BY randomKey LIMIT 1)`
    }

    constructor(connector: Connector) {
        super(connector);
    }

    async getFirstSong(shuffled?: boolean): Promise<Song> {
        const query = shuffled? this.queries.getFirstShuffledSong: this.queries.getFirstSong;
        return this.connector.get<Song>(query);
    }

    async getCurrentSong(): Promise<QueueRecord> {
        return this.connector.get<QueueRecord>(this.queries.getCurrentSong);
    }

    async queueSong(songId: number, current?: boolean): Promise<void> {
        const currentBit = (current ? current : false) ? 1 : 0;
        console.log(`current: ${currentBit}`);
        return this.connector.run(this.queries.queueSong, { songId, current: currentBit });
    }

    async clearQueue(): Promise<void> {
        return this.connector.run(this.queries.clearQueue);
    }

    async getNextSongInQueue(shuffled: boolean, repeat: boolean): Promise<Song> {
        const query = shuffled ? this.queries.getNextSongInShuffledQueue : this.queries.getNextSongInQueue
        let nextSong = await this.connector.get<Song>(query);
        if(!nextSong && repeat){
            nextSong = await this.getFirstSong(shuffled);
        }

        return nextSong;
    }

    async getQueueSize(): Promise<number> {
        return super.count('queue');
    }

    async setSongAsCurrent(songId: number): Promise<void> {
        //TODO: wrap these two queries in a transaction
        await this.connector.run(this.queries.setCurrentSongToNotCurrent);
        return this.connector.run(this.queries.setSongToCurrent, { songId })
    }

    async queueAlbum(albumId: number, setCurrent?: boolean): Promise<void> {
        const _setCurrent = setCurrent ? 1 : 0;
        return this.connector.run(this.queries.queueAlbum, { albumId, setCurrent: _setCurrent });
    }

    async queueArtist(artistId: number, setCurrent?: boolean): Promise<void> {
        const _setCurrent = setCurrent ? 1 : 0;
        return this.connector.run(this.queries.queueArtist, { artistId, setCurrent: _setCurrent });
    }

    async queueAllSongs(): Promise<void> {
        await this.clearQueue();
        return this.connector.run(this.queries.queueAllSongs);
    }

    async moveCurrentSongToShuffledQueueStart(): Promise<void> {
        return this.connector.run(this.queries.moveCurrentSongToShuffledQueueStart);
    }

    async setFirstShuffledSongCurrent() {
        return this.connector.run(this.queries.setFirstShuffledSongCurrent);
    }
}