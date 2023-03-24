const path = require('path')

const { app, BrowserWindow } = require('electron')

require('electron-reload')(path.join(__dirname, '../', '../'), {
  electron: path.join(__dirname, '../', '../', 'node_modules', '.bin', 'electron')
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
       preload: path.join(__dirname, 'preload.js') 
    }
  });

  win.loadFile('../app/app.component.html');

  win.webContents.openDevTools();

}
app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})