export interface HandlerWrapper {
    constructor: any,
    functions: string[]
}

export const handlerMethods: {[className: string]: HandlerWrapper} = {};

/**
 * Decorator function for annoting service methods that we want to expose a handler for in the ipcMain context so the renderer process can find them
 * @param target
 * @param functionName 
 * @param descriptor 
 */
export function handler(target: any, functionName: string, descriptor: PropertyDescriptor): void{
    const className = target.constructor.name;
    if(!handlerMethods[className]){
        handlerMethods[className] = {
            constructor: target.constructor,
            functions: []
        };
    }
    
    if(!handlerMethods[className].functions.includes(functionName)){
        handlerMethods[className].functions.push(functionName);
    }
}