export interface HandlerWrapper {
    constructor: any,
    functions: string[]
}

export const handlerMethods: {[functionName: string]: boolean} = {};

/**
 * Decorator function for annoting service methods that we want to expose a handler for in the ipcMain context so the renderer process can find them
 * @param target
 * @param functionName 
 * @param descriptor 
 */
export function handler(target: any, functionName: string, descriptor: PropertyDescriptor): void{
    handlerMethods[functionName] = true;
}