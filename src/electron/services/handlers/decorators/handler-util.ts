import { ipcMain } from "electron";
import { HandlerWrapper, handlerMethods } from "./handlerDecorator";
import { SongService } from "../song/songService";


/**
 * Inject handlers for all service methods annoted with @handler into the ipcMain context.
 */
export function injectAllHandlers() {
    const results = {};

    //Unfortunately do to tree shaking, we need to declare an instance of each service here or the imports for the service will be removed during transpiling
    // and then they will not be decorated.
    const ss = new SongService();


    Object.keys(handlerMethods).forEach((serviceClassName) => {
        const handlerWrapper: HandlerWrapper = handlerMethods[serviceClassName];
        
        const service = new handlerWrapper.constructor();
        handlerMethods[serviceClassName].functions.forEach((handler) => {
            ipcMain.handle(handler as string, (event, arg) => {
                const handlerFunction = service[handler];
                return handlerFunction.call();
            });
        });
    });
}
