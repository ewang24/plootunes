import { Connector } from "../../../../../core/db/dto/connector";
import { SystemDto } from "../../../../../core/db/dto/systemDto";
import { handler } from "../../decorators/handlerDecorator";

export class SystemService{

    systemDto: SystemDto;

    constructor(connector: Connector){
        this.systemDto = new SystemDto(connector);
    }

    @handler
    async isShuffled(): Promise<boolean>{
        return await this.systemDto.isShuffled();
    }

    @handler
    async setShuffled(shuffled: boolean): Promise<void>{
        return this.systemDto.setShuffled(shuffled);
    }

    @handler
    async isRepeat(): Promise<boolean>{
        return await this.systemDto.isRepeat();
    }
 
    @handler
    async setRepeat(repeat: boolean): Promise<void>{
        return this.systemDto.setRepeat(repeat);
    }
}