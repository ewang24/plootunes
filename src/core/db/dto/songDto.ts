import { Song } from "../dbEntities/song";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class SongDto{

    queries: Queries = {
        getSongById: "SELECT * FROM song where id = $songId",
        getSongs: "SELECT * FROM song where",
        getSongsByAlbum: "SELECT * FROM song where albumId = $albumId"
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async getSong(songId: number): Promise<Song>{
        const song = await this.connector.get<Song>(this.queries.getSongById, {songId})
        console.log(`song: ${JSON.stringify(song)}`)
        return song;
    }

    async getSongs(): Promise<Song[]>{
        return this.connector.getAll(this.queries.getSongs);
    }
    
    async getSongsByAlbum(albumId: number): Promise<Song[]>{
        try{
            return this.connector.getAll<Song>(this.queries.getSongsByAlbum, {albumId});
        }
        catch(err){
            console.error(`An error occurred in getSongsByAlbum: ${JSON.stringify(err, null, 2)}`)
        }
    }
}