// import { Database, OPEN_READONLY, Statement } from "sqlite3";
import { handler } from "../../decorators/handlerDecorator";
// import { BaseHandlerService } from "../baseHandlerService";
import { Song, SongWithAlbum } from "../../../../../core/db/dbEntities/song";
import { SongDto } from "../../../../../core/db/dto/songDto";
import { Connector } from "../../../../../core/db/dto/connector";

export class SongService{

  songDto: SongDto;

  constructor(connector: Connector) {
    this.songDto = new SongDto(connector);
  }

  @handler
  async getSongs(includeAlbum?: boolean): Promise<Song[]>{
    console.log(`fetching all songs. With album info: ${includeAlbum}`);
    if(includeAlbum){
      return this.songDto.getSongsWithAlbum();
    }

    return this.songDto.getSongs();
  }

  @handler
  async getSongsByAlbum(albumId: number): Promise<Song[]> {
    return this.songDto.getSongsByAlbum(albumId);
  }

  @handler
  async getSongsByArtist(artistId: number): Promise<SongWithAlbum[]>{
    return this.songDto.getSongsByArtist(artistId);
  }

}