import { Artist } from "../dbEntities/artist";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class ArtistDto{
    static queries: Queries = {
        getArtist: "SELECT * FROM artist WHERE id = $artistId",
        getArtists: "SELECT * FROM artist ORDER BY name",
        getAllArtistIds: "SELECT id FROM artist"
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async getArtist(artistId: number):Promise<Artist>{
        return this.connector.get<Artist>(ArtistDto.queries.getArtist, {artistId});
    }

    async getArtists(): Promise<Artist[]>{
        return this.connector.getAll<Artist>(ArtistDto.queries.getArtists);
    }

    async getRandomArtist(): Promise<Artist>{
        const allArtistIds = await this.connector.getAll<Partial<Artist>>(ArtistDto.queries.getAllArtistIds);
        const rand = Math.floor(Math.random() * (allArtistIds.length));
        return this.getArtist(allArtistIds[rand].id);
    }
}