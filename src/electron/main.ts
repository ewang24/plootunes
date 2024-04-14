import * as path from "path";
import { BrowserWindow, ipcMain, ipcRenderer } from "electron";

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
        Main.mainWindow = new BrowserWindow(
            {
                width: 800, height: 600,
                webPreferences: {
                    preload: path.join(__dirname, '../preload.js')
                }
            }
        );
        Main.mainWindow!
            .loadURL('http://localhost:3000');
        Main.mainWindow!.on('closed', Main.onClose);
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        // we pass the Electron.App object and the  
        // Electron.BrowserWindow into this function 
        // so this class has no dependencies. This 
        // makes the code easier to write tests for 
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}

ipcMain.on('test', (event, arg) => {
    const data = 'data from main process';
    event.sender.send('test', data);
});