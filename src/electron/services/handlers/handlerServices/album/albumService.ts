import { handler } from "../../decorators/handlerDecorator";
import { Album } from "../../../../../core/db/dbEntities/album";
import { Connector } from "../../../../../core/db/dto/connector";
import { AlbumDto } from "../../../../../core/db/dto/albumDto";

//artist id -> album id -> cover
export type AlbumCoverCache = Record<number, Record<number, string>>;

export class AlbumService{
  
  albumDto: AlbumDto;

  constructor(connector: Connector) {
    this.albumDto = new AlbumDto(connector);
  }

  @handler
  async fetchAlbums(): Promise<Album[]> {
    return this.albumDto.getAlbums();
  }

  @handler
  async getAlbumsForArtist(artistId: number): Promise<Album[]>{
    return this.albumDto.getAlbumsForArtist(artistId);
  }
}