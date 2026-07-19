import { Song } from "../../../../core/db/dbEntities/song";
import { ElectronUtil } from "../../util/electronUtil";

export class SongService{
    static async getSongs(includeAlbum?: boolean): Promise<Song[]>{
        return ElectronUtil.invoke('getSongs', includeAlbum || false);
    }

    static async getSongsByAlbum(albumId: number): Promise<Song[]>{
        return ElectronUtil.invoke('getSongsByAlbum', albumId);
    }

    static async getSongsByArtist(artistId: number): Promise<Song[]>{
        return ElectronUtil.invoke('getSongsByArtist', artistId);
    }
}