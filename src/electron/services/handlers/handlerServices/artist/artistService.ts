import { Artist } from "../../../../../core/db/dbEntities/artist";
import { ArtistDto } from "../../../../../core/db/dto/artistDto";
import { Connector } from "../../../../../core/db/dto/connector";
import { handler } from "../../decorators/handlerDecorator";

export class ArtistService{
  
    albumDto: ArtistDto;
  
    constructor(connector: Connector) {
      this.albumDto = new ArtistDto(connector);
    }
  
    @handler
    async getArtists(): Promise<Artist[]> {
      return this.albumDto.getArtists();
    }
  }