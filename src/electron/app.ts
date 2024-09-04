const fs = require('fs');
import { app, BrowserWindow } from 'electron';
import Main from './main';

try { 
    require('electron-reloader')(module
        , { 
        debug: true, 
        watchMain: true
    }
); 
} catch (err) { console.log(`Error: ${JSON.stringify(err)}`);} 

async function init(){
    const propertiesFile = fs.readFileSync('../../properties.json');
    const properties = JSON.parse(propertiesFile);
    process.env.DB_PATH = `${properties["DB_PATH"]}/plootunes.sqlite`;
    Main.main(app, BrowserWindow);
}

init();