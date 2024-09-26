import { SongWithAlbum } from "./song";

export interface SongsWithCurrentlyPlaying {
    songs: SongWithAlbum[];
    currentlyPlaying: SongWithAlbum;
}