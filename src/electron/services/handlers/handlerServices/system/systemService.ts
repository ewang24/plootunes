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
        const shuffled = await this.systemDto.isShuffled();
        console.log(`shuffled: ${shuffled}`);
        return shuffled;
    }

    @handler
    async setShuffled(shuffled: boolean): Promise<void>{
        return this.systemDto.setShuffled(shuffled);
    }
}