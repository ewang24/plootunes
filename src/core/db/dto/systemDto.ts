import { System } from "../dbEntities/system";
import { Connector } from "./connector";
import { Queries } from "./queries";

export const SYSTEM_KEYS = {
    shuffledConfig: {
        key: 'SHUFFLED',
        shuffled: "IS_SHUFFLED",
        unshuffled: "UNSHUFFLED"
    }
}

export class SystemDto{
 
    queries: Queries = {
        isShuffled: `SELECT systemValue FROM system WHERE systemKey = '${SYSTEM_KEYS.shuffledConfig.key}'`,
        setShuffled: `UPDATE system SET systemValue = $shuffled WHERE systemKey = '${SYSTEM_KEYS.shuffledConfig.key}'`
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async isShuffled(): Promise<boolean>{
        const {systemValue} = await this.connector.get<System>(this.queries.isShuffled);
        console.log(systemValue);
        return systemValue === SYSTEM_KEYS.shuffledConfig.shuffled
    }

    async setShuffled(shuffled: boolean): Promise<void>{
        const shuffledValue = shuffled? SYSTEM_KEYS.shuffledConfig.shuffled: SYSTEM_KEYS.shuffledConfig.unshuffled
        return this.connector.run(this.queries.setShuffled, {shuffled: shuffledValue})
    }
}