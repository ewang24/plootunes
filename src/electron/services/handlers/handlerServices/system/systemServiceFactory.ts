import { ConnectorFactory } from "../../../../db/connectorFactory";
import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { SystemService } from "./systemService";

@handlerFactory
export class SystemServiceFactory implements HandlerFactoryDecorator{
    
    createInstance(): Object {
        const connectorFactory = new ConnectorFactory();
        return new SystemService(connectorFactory.createConnector());
    }
}