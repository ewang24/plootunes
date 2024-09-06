import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { AlbumService } from "./albumService";

@handlerFactory
export class AlbumServiceFactory implements HandlerFactoryDecorator{
    createInstance(): Object {
        // const connectorFactory = new ConnectorFactory();
        return new AlbumService();
    }
}