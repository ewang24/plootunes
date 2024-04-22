import * as path from "path";
import { BrowserWindow } from "electron";
import { injectAllHandlers } from "./services/handlers/decorators/handler-util";

export default class Main {
    static mainWindow: Electron.BrowserWindow | null;
    static application: Electron.App;
    static BrowserWindow;
    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object. 
        Main.mainWindow = null;
    }

    private static onReady() {

        injectAllHandlers();

        Main.mainWindow = new BrowserWindow(
            {
                width: 800, height: 600,
                webPreferences: {
                    //This file will point to preload.ts, which when transpiled becomes preload.js in the dist folder
                    preload: path.join(__dirname, './preload.js')
                }
            }
        );
        Main.mainWindow!
            .loadURL('http://localhost:3000');
        Main.mainWindow!.on('closed', Main.onClose);
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) { 
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}