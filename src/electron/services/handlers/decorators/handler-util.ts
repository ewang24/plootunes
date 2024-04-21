// import { ipcMain } from "electron";
// import { handlerMethods } from "./handlerDecorator";

// export function injectAllHandlers() {
//     const results = {};

//     //serviceClassName will be the name of one of the services that house @handler decorated methods (eg SongService)
//     Object.keys(handlerMethods).forEach((serviceClassName) => {
//         const ServiceClassReference = eval(serviceClassName);
//         if (!(typeof ServiceClassReference === 'function')) {
//             throw new Error(`No class found with name ${ServiceClassReference}, cannot instantiate`);
//         }
        
//         const service = new ServiceClassReference();
//         handlerMethods[serviceClassName].forEach((handler) => {
//             ipcMain.handle(handler as string, (event, arg) => {
//                 const handlerFunction = ServiceClassReference[handler];
//                 return handlerFunction.call();
//             });
//         });
//     });
// }
