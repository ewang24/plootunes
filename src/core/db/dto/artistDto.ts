import { Artist } from "../dbEntities/artist";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class ArtistDto{
    static queries: Queries = {
        getArtists: "SELECT * FROM artist"
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async getArtists(): Promise<Artist[]>{
        return this.connector.getAll<Artist>(ArtistDto.queries.getArtists);
    }
}