import { Album } from "../dbEntities/album";
import { Artist } from "../dbEntities/artist";
import { ArtistDto } from "./artistDto";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class AlbumDto {
    queries: Queries = {
        getAlbums: "SELECT * FROM album",
        getAlbumsForArtist: "SELECT * FROM album WHERE artistId = $artistId"
    }

    connector: Connector;

    constructor(connector: Connector) {
        this.connector = connector;
    }

    async getAlbums(): Promise<Album[]> {
        const [albums, artists]: [Album[], Artist[]] =
            await Promise.all([
                this.connector.getAll<Album>(this.queries.getAlbums),
                this.connector.getAll<Artist>(ArtistDto.queries.getArtists)
            ]);

        const artistMap: { [key: number]: string } = {};
        for (const album of albums) {
            if (!artistMap[album.artistId]) {
                const artist = artists.find((value) => value.id === album.artistId);
                artistMap[album.artistId] = artist ? artist.name : 'unknown';
            }

            album.artistName = artistMap[album.artistId];
        }

        return albums;
    }

    async getAlbumsForArtist(artistId: number): Promise<Album[]> {
        return this.connector.getAll(this.queries.getAlbumsForArtist, { artistId })
    }
}