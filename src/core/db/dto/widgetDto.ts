import { Widget } from "../dbEntities/widget";
import { Connector } from "./connector";
import { Queries } from "./queries";

export class WidgetDto{

    queries: Queries = {
        getWidgets: 'SELECT * FROM widget ORDER BY displayOrder',
        addWidget: 'INSERT INTO widget (widgetType, displayOrder) SELECT $widgetType as widgetType, (SELECT COALESCE(MAX(displayOrder), 0) + 1 FROM widget) as displayOrder'
    }

    connector: Connector;

    constructor(connector: Connector) {
        this.connector = connector;
    }

    async getWidgets(){
        return this.connector.getAll<Widget>(this.queries.getWidgets);
    }

    async addWidget(widgetType: string){
        return this.connector.run(this.queries.addWidget, {widgetType});
    }
}