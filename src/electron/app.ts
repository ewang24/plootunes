const fs = require('fs');
import { app, BrowserWindow } from 'electron';
import Main from './main';

async function init(){
    const propertiesFile = await fs.readFile('../../properties.json', 'utf8');
    const properties = JSON.parse(propertiesFile);
    process.env.DB_PATH = `${properties["DB_PATH"]}/plootunes.sqlite`;
    Main.main(app, BrowserWindow);
}