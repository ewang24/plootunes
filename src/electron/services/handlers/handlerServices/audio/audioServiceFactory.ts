import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { AudioService } from "./audioService";

@handlerFactory
export class AudioServiceFactory implements HandlerFactoryDecorator{
    createInstance(): Object {
        return new AudioService();
    }
}