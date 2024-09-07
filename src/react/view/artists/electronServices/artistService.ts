import { Artist } from "../../../../core/db/dbEntities/artist";
import { ElectronUtil } from "../../util/electronUtil";

export class ArtistService{
    static async getArtists(): Promise<Artist[]>{
        return ElectronUtil.invoke<Artist[]>('getArtists');
    }
}