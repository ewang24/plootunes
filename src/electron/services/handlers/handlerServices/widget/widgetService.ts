import { Connector } from "../../../../../core/db/dto/connector";
import { WidgetDto } from "../../../../../core/db/dto/widgetDto";
import { handler } from "../../decorators/handlerDecorator";

export class WidgetService{

    widgetDto: WidgetDto;

    constructor(connector: Connector) {
        this.widgetDto = new WidgetDto(connector);
    }

    @handler
    async getWidgets(){
        return this.widgetDto.getWidgets();
    }

    @handler
    async addWidget(widgetType: string){
        return this.widgetDto.addWidget(widgetType);   
    }

    @handler
    async removeWidget(widgetId: number){
        return this.widgetDto.removeWidget(widgetId);
    }
}