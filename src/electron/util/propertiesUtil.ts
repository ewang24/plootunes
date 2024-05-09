const fs = require('fs');

export class PropertiesUtil{
    static initProps(): string{
        const propertiesFile = fs.readFileSync('../../properties.json');
        const properties = JSON.parse(propertiesFile);
        process.env.DB_PATH = `${properties["DB_PATH"]}/plootunes.sqlite`;
        return process.env.DB_PATH
    }
}