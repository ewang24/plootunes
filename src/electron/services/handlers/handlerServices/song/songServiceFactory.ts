import { ConnectorFactory } from "../../../../db/connectorFactory";
import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { SongService } from "./songService";

@handlerFactory
export class SongServiceFactory implements HandlerFactoryDecorator{
    createInstance(): Object {
        const connectorFactory = new ConnectorFactory();
        return new SongService(connectorFactory.createConnector());
    }
}