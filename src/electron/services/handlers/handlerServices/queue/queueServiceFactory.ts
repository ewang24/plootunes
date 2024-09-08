import { ConnectorFactory } from "../../../../db/connectorFactory";
import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { QueueService } from "./queueService";

@handlerFactory
export class QueueServiceFactory implements HandlerFactoryDecorator{
    createInstance(): Object {
        const connectorFactory = new ConnectorFactory();
        return new QueueService(connectorFactory.createConnector(true));
    }
}