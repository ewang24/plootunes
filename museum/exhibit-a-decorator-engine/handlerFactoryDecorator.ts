export const handlersFactories: HandlerFactoryDecorator[] = [];

export interface HandlerFactoryDecorator{
    createInstance(): Object;
}

export function handlerFactory<T extends {new(...args: any[]): HandlerFactoryDecorator}>(constructor: T) {
    const factory = new constructor();
    handlersFactories.push(factory);
}