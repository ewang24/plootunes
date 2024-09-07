import { Song } from "../dbEntities/song";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class SongDto{

    queries: Queries = {
        getSongs: "SELECT * FROM song where",
        getSongsByAlbum: "SELECT * FROM song where albumId = $albumId"
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
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