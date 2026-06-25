const fs = require('fs');
const path = require('path');
import { app, BrowserWindow } from 'electron';
import Main from './main';
const { fork } = require('child_process');

// Album cover images live under the platform-specific userData directory.
// Set this before forking so the express server child process inherits it.
process.env.COVERS_PATH = path.join(app.getPath('userData'), 'covers');

// try { 
//     require('electron-reloader')(module, { 
//         debug: true, 
//         watchMain: true,
//         renderer: true
//     }
// ); 
// } catch (err) { console.log(`Error: ${JSON.stringify(err)}`);} 

const serverPath = path.join(__dirname, './expressServer.js');
console.log(serverPath);
const serverProcess = fork(serverPath);

async function init() {
    const propertiesFile = fs.readFileSync('../../properties.json');
    const properties = JSON.parse(propertiesFile);
    process.env.DB_PATH = `${properties["DB_PATH"]}/plootunes.sqlite`;
    Main.main(app, BrowserWindow);
}

init();