import { Song } from "../../../../core/db/dbEntities/song";
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

    static async queueAllSongsAndPlayFirstSong(): Promise<Song>{
        return ElectronUtil.invoke<Song>("queueAllSongsAndPlayFirstSong");
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

    static async shuffleAllSongsAndPlay(): Promise<Song>{
        return ElectronUtil.invoke<Song>("shuffleAllSongsAndPlay");
    }

    static async getAllQueuedSongs(): Promise<SongsWithCurrentlyPlaying>{
        return ElectronUtil.invoke<SongsWithCurrentlyPlaying>("getAllQueuedSongs");
    }

    static async playRandomAlbum(): Promise<Song>{
        return ElectronUtil.invoke<Song>("playRandomAlbum");
    }

    static async playRandomArtist(): Promise<Song>{
        return ElectronUtil.invoke<Song>("playRandomArtist");
    }
}