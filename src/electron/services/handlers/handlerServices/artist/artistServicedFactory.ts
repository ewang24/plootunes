import { ConnectorFactory } from "../../../../db/connectorFactory";
import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { ArtistService } from "./artistService";

@handlerFactory
export class ArtistServiceFactory implements HandlerFactoryDecorator{
    createInstance(): Object {
        const connectorFactory = new ConnectorFactory();
        return new ArtistService(connectorFactory.createConnector());
    }
}