const fs = require('fs');
import { app, BrowserWindow } from 'electron';
import Main from './main';

async function init(){
    const propertiesFile = fs.readFileSync('../../properties.json');
    const properties = JSON.parse(propertiesFile);
    process.env.DB_PATH = `${properties["DB_PATH"]}/plootunes.sqlite`;
    Main.main(app, BrowserWindow);
}

init();