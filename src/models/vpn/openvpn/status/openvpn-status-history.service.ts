import { getRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Service } from "../../../../fonaments/services/service";
import { OpenVPN } from "../OpenVPN";
import { OpenVPNStatusHistory } from "./openvpn-status-history";

export type CreateOpenVPNStatusHistoryData = {
    timestamp: number;
    name: string;
    address: string;
    bytesReceived: number;
    bytesSent: number;
    connectedAt: Date;
    disconnectedAt?: Date;
}

export type FindOpenVPNStatusHistoryOptions = {
    rangeTimestamp?: [number, number],
    name?: string,
    address?: string
}

export type ClientHistoryConnection = {
    connected_at: Date,
    disconnected_at: Date | null,
    bytesSent: number,
    bytesReceived: number,
    address: string
}

export type ClientHistory = {
    connections: ClientHistoryConnection[]
}

export type FindResponse = {
    [cn: string]: ClientHistory
}

type GraphDataPoint = {
    timestamp: number,
    bytesReceived: number,
    bytesSent: number
}

export type GraphDataResponse = GraphDataPoint[];


export class OpenVPNStatusHistoryService extends Service {
    protected _repository: Repository<OpenVPNStatusHistory>;

    public async build(): Promise<Service> {
        this._repository = getRepository(OpenVPNStatusHistory);
        return this;
    }

    /**
     * Creates and persists a batch.
     * It detects CN disconnection and creates entries with disconnectedAt information
     * 
     * @param serverOpenVPNId 
     * @param data 
     * @returns 
     */
    async create(serverOpenVPNId: number, data: CreateOpenVPNStatusHistoryData[]): Promise<OpenVPNStatusHistory[]> {
        // Makes sure openvpn is a server
        const serverOpenVPN: OpenVPN = await getRepository(OpenVPN).createQueryBuilder('openvpn')
            .innerJoin('openvpn.crt', 'crt')
            .innerJoinAndSelect('openvpn.firewall', 'firewall')
            .where('openvpn.parentId IS NULL')
            .andWhere('crt.type =  2')
            .andWhere('openvpn.id = :id', {id: serverOpenVPNId})
            .getOneOrFail();

        // Get the last entry already persisted from the openvpn server. This entry is used to get  its timestamp as it will be used to
        // retrieve the last batch. If there is not lastEntry means there is not lastBatch thus all disconnect detection logic
        // won't be applied.
        const lastEntry: OpenVPNStatusHistory | undefined = await getRepository(OpenVPNStatusHistory).createQueryBuilder('history')
            .where('history.openVPNServerId = :openvpn', {openvpn: serverOpenVPN.id})
            .orderBy('history.timestamp', 'DESC')
            .getOne()
        
        let lastbatch: OpenVPNStatusHistory[] = [];
        if (lastEntry) {
            lastbatch = await getRepository(OpenVPNStatusHistory).createQueryBuilder('history')
            .where('history.openVPNServerId = :openvpn', {openvpn: serverOpenVPN.id})
            .andWhere('history.timestamp = :timestamp', {timestamp: lastEntry.timestamp})
            .getMany();
        }

        // If the data is empty, then set disconnect timestamp on the previous batch and returns
        if (data.length === 0) {
            lastbatch.forEach(item => {
                if (item.disconnectedAt === null) {
                    item.disconnectedAt = new Date(item.timestamp);
                }
            })
            await getRepository(OpenVPNStatusHistory).save(lastbatch);
            return [];
        }

        // Get the timestamps of the records to be persisted
        // IMPORTANT! timestamps must be ordered from lower to higher in order to detect disconnection correctly
        let timestamps: number[] = [...new Set(data.map(item => item.timestamp))].sort((a,b) => a < b ? 1 : -1);

        let entries: OpenVPNStatusHistory[] = [];

        for(let timestamp of timestamps) {
            const batch: CreateOpenVPNStatusHistoryData[] = data.filter(item => item.timestamp === timestamp);
        
            // If the current batch doesn't have an entry which exists on the previous batch,
            // then we must add an entry to the batch with a disconnectedAt value
            for (let previous of lastbatch.filter(item => item.disconnectedAt === null)) {
                //If the persisted name is not present in the batch, then we must set as disconnected
                if (batch.findIndex(item => previous.name === item.name ) < 0) {
                    previous.disconnectedAt = new Date(previous.timestamp);
                    await getRepository(OpenVPNStatusHistory).save(previous);
                }
            }

            //Once this batch is persisted, they become lastbatch for the next iteration
            lastbatch = await getRepository(OpenVPNStatusHistory).save(batch.map(item => {
                (item as OpenVPNStatusHistory).openVPNServerId = serverOpenVPN.id;
                return item;
            }));

            entries = entries.concat(lastbatch);
        }
        return entries;
    }

    /**
     * Finds OpenVPNStatusHistory based on the openvpn server id and the options provided
     * 
     * @param openVpnServerId 
     * @param options 
     * @returns 
     */
    find(openVpnServerId: number, options: FindOpenVPNStatusHistoryOptions = {}): Promise<OpenVPNStatusHistory[]> {
        const query: SelectQueryBuilder<OpenVPNStatusHistory> = this._repository.createQueryBuilder('record')
            .andWhere(`record.openVPNServerId = :serverId`, {serverId: openVpnServerId});

        if (Object.prototype.hasOwnProperty.call(options, "rangeTimestamp")) {
            query.andWhere(`record.timestamp BETWEEN :start and :end`, {
                start: options.rangeTimestamp[0],
                end: options.rangeTimestamp[1]
            })
        }

        if (Object.prototype.hasOwnProperty.call(options, "name")) {
            query.andWhere(`record.name like :name`, {name: options.name})
        }

        if (Object.prototype.hasOwnProperty.call(options, "address")) {
            query.andWhere(`record.address = :address`, {address: options.address})
        }

        return query.orderBy('timestamp', 'ASC').getMany();
    }

    /**
     * Return the data required to generate the history table
     * 
     * @param openVpnServerId 
     * @param options 
     * @returns 
     */
    async history(openVpnServerId: number, options: FindOpenVPNStatusHistoryOptions = {}): Promise<FindResponse> {
        const results: OpenVPNStatusHistory[] = await this.find(openVpnServerId, options);

        let names: string[] = [...new Set(results.map(item => item.name))];
        let result: FindResponse = {}

        for(let name of names) {
            const entries: OpenVPNStatusHistory[] = results.filter(item => item.name === name);
            let connections: ClientHistoryConnection[] = [];
            
            let currentConnection: undefined | ClientHistoryConnection = undefined;
            for(let entry of entries) {
                if (currentConnection === undefined) {
                    currentConnection = {
                        connected_at: entry.connectedAt,
                        disconnected_at: null,
                        bytesSent: entry.bytesSent,
                        bytesReceived: entry.bytesReceived,
                        address: entry.address
                    }

                    currentConnection.bytesReceived = entry.bytesReceived;
                    currentConnection.bytesSent = entry.bytesSent;

                    if (entry.disconnectedAt) {
                        currentConnection.disconnected_at = entry.disconnectedAt
                        connections.push(currentConnection);
                        currentConnection = undefined;
                    }
                }
            }
            if (currentConnection) {
                connections.push(currentConnection);
            }

            result[name] = {
                connections: connections
            }
        }

        return result;
    }

    /**
     * Returns the graph points data in order to print graphs
     * 
     * @param openVpnServerId 
     * @param options 
     * @returns 
     */
    async graph(openVpnServerId: number, options: FindOpenVPNStatusHistoryOptions = {}): Promise<GraphDataResponse> {
        const results: OpenVPNStatusHistory[] = await this.find(openVpnServerId, options);

        // Get results timestamps
        // IMPORTANT! timestamps must be ordered from lower to higher in order to detect disconnection correctly
        let timestamps: number[] = [...new Set(results.map(item => item.timestamp))].sort((a,b) => a < b ? 1 : -1);

        const response: GraphDataResponse = timestamps.map(timestamp => {
            //Get all records with the same timestamp
            const records: OpenVPNStatusHistory[] = results.filter(item => item.timestamp === timestamp);

            // Then calculate bytesReceived/bytesSent accumulated.
            // bytesReceviedSent will contain all bytesReceived added in index 0 and all bytesSent added in index 1
            const bytesReceivedSent: [number, number] = records.reduce<[number, number]>((bytes: [number, number], item: OpenVPNStatusHistory) => {
                return [bytes[0] + item.bytesReceived, bytes[1] + item.bytesSent];
            }, [0, 0])

            return {
                timestamp,
                bytesReceived: bytesReceivedSent[0],
                bytesSent: bytesReceivedSent[1]
            };
        });

        return this.limitGraphPoints(response);
    }

    /**
     * If the results contains more than limit points, it calculates average points based on provided points
     * in order to fit the limit
     * 
     * @param data 
     * @param limit 
     * @returns 
     */
    protected limitGraphPoints(data: GraphDataResponse, limit: number = 200): GraphDataResponse {
        if (data.length < limit) {
            return data;
        }

        const count: number = Math.ceil(data.length / limit);
        const result: GraphDataResponse = []

        while(data.length > 0) {
            const group: GraphDataResponse = data.splice(0, count);

            result.push({
                //Timestamp median
                timestamp: group[0].timestamp + ((group[count - 1].timestamp - group[0].timestamp)/2),
                // BytesReceived / Sent average
                bytesReceived: group.reduce<number>((average, item) => { return average + item.bytesReceived}, 0) / group.length,
                bytesSent: group.reduce<number>((average, item) => { return average + item.bytesSent}, 0) / group.length,
            });
        }

        return result;
    }
}