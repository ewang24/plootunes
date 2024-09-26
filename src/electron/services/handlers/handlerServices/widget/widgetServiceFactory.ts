import { ConnectorFactory } from "../../../../db/connectorFactory";
import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { WidgetService } from "./widgetService";

@handlerFactory
export class WidgetServiceFactory implements HandlerFactoryDecorator{
    createInstance(): Object {
        const connectorFactory = new ConnectorFactory();
        return new WidgetService(connectorFactory.createConnector());
    }
}