import { Song } from "../../../../core/db/dbEntities/song";
import { ElectronUtil } from "../../util/electronUtil";

export class QueueService{
    static async getNextSongInQueue(): Promise<Song>{
        return ElectronUtil.invoke<Song>("getNextSongInQueue");
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
}