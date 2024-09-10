import { Connector } from "../../../../../core/db/dto/connector";
import { QueueDto } from "../../../../../core/db/dto/queueDto";
import { handler } from "../../decorators/handlerDecorator";
const fs = require('fs');

export class QueueService{
    queueDto: QueueDto;

    constructor(connector: Connector){
        this.queueDto = new QueueDto(connector);
    }

    @handler
    async queueSong(songId: number): Promise<void>{
        return this.queueDto.queueSong(songId);
    }
}