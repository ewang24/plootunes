import * as SQLite from 'expo-sqlite';
import { ExpoSqliteConnector } from './expoSqliteConnector';
export class ExpoSqliteConnectorFactory {

    async createConnector() {
        const db = await SQLite.openDatabaseAsync('databaseName');
        return new ExpoSqliteConnector(db);
    }

}