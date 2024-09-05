const path = require('path');
const fs = require('fs');

export class PropertiesUtil{
    static initProps(): string{
        const propertiesFilePath = path.resolve(__dirname, '../../../properties.json');
        const propertiesFile = fs.readFileSync(propertiesFilePath);
        const properties = JSON.parse(propertiesFile);
        process.env.DB_PATH = `${properties["DB_PATH"]}/plootunes.sqlite`;
        return process.env.DB_PATH
    }
}