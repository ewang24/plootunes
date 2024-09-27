import { Song, SongWithAlbum } from "../dbEntities/song";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class SongDto {

    queries: Queries = {
        getSongById: `SELECT s.*, alb.name as albumName, alb.coverImage as albumCoverImage, art.name as artistName 
            FROM song s INNER JOIN album alb ON alb.id = s.albumId
            INNER JOIN artist art on art.id = alb.artistId
            where s.id = $songId
        `,
        getSongs: "SELECT * FROM song ORDER BY song.name",
        getSongsWithAlbum: `
            SELECT s.*, alb.name as albumName, alb.coverImage as albumCoverImage, art.name as artistName 
            FROM song s INNER JOIN album alb on s.albumId = alb.id 
            INNER JOIN artist art on art.id = alb.artistId 
            ORDER BY s.name
        `,
        getSongsByAlbum: `SELECT s.*, alb.name as albumName, alb.coverImage as albumCoverImage, art.name as artistName 
            FROM song s INNER JOIN album alb ON alb.id = s.albumId
            INNER JOIN artist art on art.id = alb.artistId 
            WHERE albumId = $albumId 
            ORDER BY songPosition
        `,
        getSongsByArtist: `
            SELECT s.*, alb.name as albumName, alb.coverImage as albumCoverImage, art.name as artistName 
            FROM song s INNER JOIN album alb ON alb.id = s.albumId
            INNER JOIN artist art on art.id = alb.artistId
            WHERE alb.artistId = $artistId 
            ORDER BY alb.name, s.albumId, s.songPosition
            `,
        getSongsWithAlbumByQueue: `
            SELECT s.*, alb.name as albumName, alb.coverImage as albumCoverImage, art.name as artistName 
            FROM song s INNER JOIN album alb on s.albumId = alb.id 
            INNER JOIN artist art on art.id = alb.artistId
            INNER JOIN queue q on s.id = q.songId 
            ORDER BY q.id`,
        getShuffledSongsWithAlbumByQueue: `
            SELECT s.*, alb.name as albumName, alb.coverImage as albumCoverImage, art.name as artistName 
            FROM song s INNER JOIN album alb on s.albumId = alb.id 
            INNER JOIN artist art on art.id = alb.artistId
            INNER JOIN queue q on s.id = q.songId
            ORDER BY q.randomKey`,
    }

    connector: Connector;

    constructor(connector: Connector) {
        this.connector = connector;
    }

    async getSong(songId: number): Promise<SongWithAlbum> {
        return this.connector.get<SongWithAlbum>(this.queries.getSongById, { songId })
    }

    async getSongs(): Promise<Song[]> {
        return this.connector.getAll(this.queries.getSongs);
    }

    async getSongsWithAlbum(): Promise<SongWithAlbum[]> {
        return this.connector.getAll<SongWithAlbum>(this.queries.getSongsWithAlbum);
    }

    async getSongsByAlbum(albumId: number): Promise<SongWithAlbum[]> {
        try {
            return this.connector.getAll<SongWithAlbum>(this.queries.getSongsByAlbum, { albumId });
        }
        catch (err) {
            console.error(`An error occurred in getSongsByAlbum: ${JSON.stringify(err, null, 2)}`)
        }
    }

    async getSongsByArtist(artistId: number): Promise<SongWithAlbum[]> {
        return this.connector.getAll<SongWithAlbum>(this.queries.getSongsByArtist, { artistId });
    }

    async getSongsByQueue(shuffled?: boolean): Promise<SongWithAlbum[]> {
        const query = shuffled ? this.queries.getShuffledSongsWithAlbumByQueue : this.queries.getSongsWithAlbumByQueue;
        return this.connector.getAll<SongWithAlbum>(query);
    }
}