export interface Song{
    id: number;
    albumId: number;
    name: string;
    songPosition: number;
    songFilePath: string;
    songLength: number;
}

export interface SongWithAlbum extends Song{
    albumName?: string;
    albumCoverImage?: string;
    artistName?: string;
}