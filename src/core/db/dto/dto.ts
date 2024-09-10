import { Connector } from "./connector";
import { Queries } from "./queries";

interface CountResponse{
    count: number;
}

export class Dto{

    globalQueries: Queries = {
        count: "SELECT COUNT(*) AS count FROM $table"
    }
    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async count(table: string): Promise<number>{
        if(table.length === 0){
            throw new Error("No table specified!");
        }
        const count = await this.connector.get<CountResponse>(this.globalQueries.count.replace("$table", table));
        return count.count;
    }
}