import { ipcMain } from "electron";
import { handlerMethods } from "./handlerDecorator";
import { handlersFactories } from "./handlerFactoryDecorator";
import './generatedHandlerImports';
import path = require("path");
import fs = require("fs");


/**
 * Inject an ipc handler for each function decorated with @handler from classes created by factories decorated with @handlerFactory
 */
export async function injectAllHandlers() {

    if (process.env.RUN_MODE === 'dev') {
        await importAllHandlerFiles();
    }

    console.error(`handler factories: ${handlersFactories}`);
    console.error(`handlers: ${JSON.stringify(handlerMethods)}`);
    for(let factory of handlersFactories){
        const handler = factory.createInstance();

        const prototype = Object.getPrototypeOf(handler);
        // console.log(JSON.stringify(handler));
        for(let key of Object.getOwnPropertyNames(prototype)){
            if(key === 'constructor'){
                continue;
            }
        
            if(typeof handler[key] === 'function' && handlerMethods[key]){
                ipcMain.handle(key as string, (event, ...args) => {
                    return handler[key].call(handler, ...args);
                });
            }
        }
    }
}

/**
 * Import all handler service files so that the decorators will apply. 
 * Doing it dynamically like this means you don't have to type out an import statement for each service,
 * and they will not be removed by treeshaking when the app is transpiled and built.
 */
async function importAllHandlerFiles(){

    //This will be in the dist folder: dist/electron/services/handlers/handlerServices
    const handlersDirectory = path.resolve(__dirname, '../handlerServices')

    const imports: Promise<any>[] = [];

    const readDirectory = async (dir: string): Promise<void> => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await readDirectory(fullPath);
            } 
            //This is going to be operating out of the dist folder when it runs, so the extensions will be .js
            else if (entry.isFile() && entry.name.endsWith('.js')) {
                imports.push(import(fullPath));
            }
        }
    };

    await readDirectory(handlersDirectory);
    await Promise.all(imports);
}