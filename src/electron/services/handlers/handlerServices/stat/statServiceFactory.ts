import { ConnectorFactory } from "../../../../db/connectorFactory";
import { handlerFactory, HandlerFactoryDecorator } from "../../decorators/handlerFactoryDecorator";
import { StatsService } from "./statService";

@handlerFactory
export class StatServiceFactor implements HandlerFactoryDecorator{

    createInstance(): Object {
        const connectorFactory = new ConnectorFactory();
        return new StatsService(connectorFactory.createConnector());
    }

}