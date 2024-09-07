import { Database, OPEN_READONLY, Statement } from "sqlite3";
import { handler } from "../../decorators/handlerDecorator";
import { Album } from "../../../../../core/db/dbEntities/album";
import { Artist } from "../../../../../core/db/dbEntities/artist";
import { Connector } from "../../../../../core/db/dto/connector";
import { AlbumDto } from "../../../../../core/db/dto/albumDto";

export class AlbumService{
  
  albumDto: AlbumDto;

  constructor(connector: Connector) {
    this.albumDto = new AlbumDto(connector);
  }

  @handler
  async fetchAlbums(): Promise<Album[]> {
    return this.albumDto.getAlbums();
  }
}