import * as path from "path";
import { BrowserWindow, ipcMain } from "electron";
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

        // const {app} = require('electron');
        // console.log(`this is the user data path: ${app.getPath('userData')}`);

        injectAllHandlers().then(() => {
            Main.mainWindow = new BrowserWindow(
                {
                    width: 800, height: 600,
                    maximizable: true,
                    webPreferences: {
                        //This file will point to preload.ts, which when transpiled becomes preload.js in the dist folder
                        preload: path.join(__dirname, './preload.js')
                    }
                }
            );

            Main.mainWindow.setMenuBarVisibility(false);
            Main.mainWindow.removeMenu();


            if (process.env.RUN_MODE === 'dev') {
                Main.mainWindow!
                    .loadURL('http://localhost:3000');
            }
            else if(process.env.RUN_MODE === 'prod'){
                Main.mainWindow.loadFile(path.join(__dirname, 'dist/front_end/index.html'));
            }
            else{
                console.log(`Unknown run mode ${process.env.RUN_MODE} found, unable to start.`);
                throw new Error(`Unknown run mode ${process.env.RUN_MODE} found, unable to start.`)
            }

            Main.mainWindow.webContents.openDevTools();
            Main.mainWindow!.on('closed', Main.onClose);

            Main.mainWindow!.once('ready-to-show', () => {
                Main.mainWindow!.maximize();
            });
        });
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}