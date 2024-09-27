import { Album } from "../dbEntities/album";
import { Artist } from "../dbEntities/artist";
import { ArtistDto } from "./artistDto";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class AlbumDto {
    queries: Queries = {
        getAlbum: "SELECT * FROM album WHERE id = $albumId",
        getAlbums: "SELECT * FROM album ORDER BY name",
        getAlbumsForArtist: "SELECT * FROM album WHERE artistId = $artistId",
        getAllAlbumIds: "SELECT id FROM album"
    }

    connector: Connector;

    constructor(connector: Connector) {
        this.connector = connector;
    }

    async getAlbum(albumId: number): Promise<Album>{
        return this.connector.get<Album>(this.queries.getAlbum, {albumId});
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

    async getRandomAlbum(): Promise<Album>{
        const allAlbumIds = await this.connector.getAll<Partial<Album>>(this.queries.getAllAlbumIds);
        const rand = Math.floor(Math.random() * (allAlbumIds.length));
        console.log(rand);
        console.log(allAlbumIds[rand]);
        return this.getAlbum(allAlbumIds[rand].id);
    }
}