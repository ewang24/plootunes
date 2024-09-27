import { Song, SongWithAlbum } from "../../../../core/db/dbEntities/song";
import { SongsWithCurrentlyPlaying } from "../../../../core/db/dbEntities/songWithCurrentlyPlaying";
import { ElectronUtil } from "../../util/electronUtil";

export class QueueService{
    static async getNextSongInQueue(): Promise<Song>{
        return ElectronUtil.invoke<Song>("getNextSongInQueue");
    }

    static async getPreviousSongInQueue(): Promise<Song>{
        return ElectronUtil.invoke<Song>("getPreviousSongInQueue");
    }

    static async transitionCurrentSong(songId: number): Promise<void>{
        return ElectronUtil.invoke<void>("transitionCurrentSong", songId);
    }

    static async playAlbum(albumId: number): Promise<void>{
        return ElectronUtil.invoke<void>("playAlbum", albumId);
    }

    static async queueAlbum(albumId: number): Promise<void>{
        return ElectronUtil.invoke<void>("queueAlbum", albumId);
    }

    static async playArtist(artistId: number): Promise<void>{
        return ElectronUtil.invoke<void>("playArtist", artistId);
    }

    static async queueArtist(artistId: number): Promise<void>{
        return ElectronUtil.invoke<void>("queueArtist", artistId);
    }

    static async queueAllSongsAndPlay(songId: number): Promise<void>{
        return ElectronUtil.invoke<void>("queueAllSongsAndPlay", songId);
    }

    static async queueAllSongsAndPlayFirstSong(): Promise<SongWithAlbum>{
        return ElectronUtil.invoke<SongWithAlbum>("queueAllSongsAndPlayFirstSong");
    }

    static async playSong(songId: number): Promise<void>{
        return ElectronUtil.invoke<void>("playSong", songId);
    }

    static async queueSong(songId: number): Promise<void>{
        return ElectronUtil.invoke<void>("queueSong", songId);
    }

    static async shuffleCurrentQueue(): Promise<void>{
        return ElectronUtil.invoke<void>("shuffleCurrentQueue");
    }

    static async shuffleAllSongsAndPlay(): Promise<SongWithAlbum>{
        return ElectronUtil.invoke<SongWithAlbum>("shuffleAllSongsAndPlay");
    }

    static async getAllQueuedSongs(): Promise<SongsWithCurrentlyPlaying>{
        return ElectronUtil.invoke<SongsWithCurrentlyPlaying>("getAllQueuedSongs");
    }

    static async playRandomAlbum(): Promise<SongWithAlbum>{
        return ElectronUtil.invoke<SongWithAlbum>("playRandomAlbum");
    }

    static async playRandomArtist(): Promise<SongWithAlbum>{
        return ElectronUtil.invoke<SongWithAlbum>("playRandomArtist");
    }
}