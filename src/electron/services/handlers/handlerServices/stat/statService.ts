import { Connector } from "../../../../../core/db/dto/connector";
import { StatDto } from "../../../../../core/db/dto/statDto";
import { handler } from "../../decorators/handlerDecorator";

export class StatsService{

    statDto: StatDto;
    
    constructor(connector: Connector){
        this.statDto = new StatDto(connector);
    }

    @handler
    async addSongPlay(songId: number): Promise<void>{
        return this.statDto.addSongPlay(songId);
    }
}