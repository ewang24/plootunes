import { Album } from '../../../../core/db/dbEntities/album';
import { ElectronUtil } from '../../util/electronUtil';

export class AlbumService{
    static async getAlbums(): Promise<Album[]>{
        return ElectronUtil.invoke<Album[]>('fetchAlbums');
    }
}