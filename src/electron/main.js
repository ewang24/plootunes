const path = require('path')
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron')
import { DbUtils } from './lib/db';

require('electron-reload')(path.join(__dirname, '../', '../'), {
  electron: path.join(__dirname, '../', '../', 'node_modules', '.bin', 'electron')
});

const createWindow = () => {
  const win = new BrowserWindow({
    title: "Hello",
    width: 800,
    height: 600,
    webPreferences: {
       preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('http://localhost:3000');

  // win.webContents.openDevTools();

}
app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


function getAllFiles(path) {
      try {
        const files = fs.readdirSync(path);
        return files;
      } catch (error) {
        console.error('Error reading directory:', error);
        return [];
      }
    }


    ipcMain.handle('getFiles', (event, path) => {
      return getAllFiles(path);
    });

    ipcMain.handle('test', (event) => {
        DbUtils.init();
    });