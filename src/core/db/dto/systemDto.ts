import { System } from "../dbEntities/system";
import { Connector } from "./connector";
import { Queries } from "./queries";

export const SYSTEM_KEYS = {
    shuffledConfig: {
        key: 'SHUFFLED',
        shuffled: "IS_SHUFFLED",
        unshuffled: "UNSHUFFLED"
    },
    repeatConfig: {
        key: 'REPEAT',
        onRepeat: "ON_REPEAT",
        offRepeat: "OFF_REPEAT"
    }
}

export class SystemDto{
 
    queries: Queries = {
        getSystemValue: `SELECT systemValue FROM system WHERE systemKey = $systemKey`,
        setShuffled: `UPDATE system SET systemValue = $shuffled WHERE systemKey = '${SYSTEM_KEYS.shuffledConfig.key}'`,
        setRepeat: `UPDATE system SET systemValue = $repeat WHERE systemKey = '${SYSTEM_KEYS.repeatConfig.key}'`
    }

    connector: Connector;

    constructor(connector: Connector){
        this.connector = connector;
    }

    async isShuffled(): Promise<boolean>{
        const {systemValue} = await this.connector.get<System>(this.queries.getSystemValue, {systemKey: SYSTEM_KEYS.shuffledConfig.key});
        return systemValue === SYSTEM_KEYS.shuffledConfig.shuffled
    }

    async setShuffled(shuffled: boolean): Promise<void>{
        const shuffledValue = shuffled? SYSTEM_KEYS.shuffledConfig.shuffled: SYSTEM_KEYS.shuffledConfig.unshuffled
        return this.connector.run(this.queries.setShuffled, {shuffled: shuffledValue})
    }

    async isRepeat(): Promise<boolean>{
        const {systemValue} = await this.connector.get<System>(this.queries.getSystemValue, {systemKey: SYSTEM_KEYS.repeatConfig.key});
        return systemValue === SYSTEM_KEYS.repeatConfig.onRepeat;
    }

    async setRepeat(repeat: boolean): Promise<void>{
        const repeatValue = repeat? SYSTEM_KEYS.repeatConfig.onRepeat: SYSTEM_KEYS.repeatConfig.offRepeat
        return this.connector.run(this.queries.setRepeat, {repeat: repeatValue})
    }
}