/*!
    Copyright 2021 SOLTECSIS SOLUCIONES TECNOLOGICAS, SLU
    https://soltecsis.com
    info@soltecsis.com


    This file is part of FWCloud (https://fwcloud.net).

    FWCloud is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    FWCloud is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with FWCloud.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Column, Entity, getRepository, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Interface } from "../../interface/Interface";
import { IPObj } from "../../ipobj/IPObj";
import { IPObjGroup } from "../../ipobj/IPObjGroup";
import Model from "../../Model";
import { OpenVPN } from "../../vpn/openvpn/OpenVPN";
import { OpenVPNPrefix } from "../../vpn/openvpn/OpenVPNPrefix";
import { RoutingTable } from "../routing-table/routing-table.model";
import { RouteGroup } from "../route-group/route-group.model";
import db from "../../../database/database-manager";
import { RouteToOpenVPNPrefix } from "./route-to-openvpn-prefix.model";
import { RouteToOpenVPN } from "./route-to-openvpn.model";
import { RouteToIPObjGroup } from "./route-to-ipobj-group.model";
import { RouteToIPObj } from "./route-to-ipobj.model";

const tableName: string = 'route';

@Entity(tableName)

export class Route extends Model {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'routing_table'})
    routingTableId: number;

    @ManyToOne(type => RoutingTable, model => model.routes)
    @JoinColumn({
        name: 'routing_table'
    })
    routingTable: RoutingTable;

    
    @Column({name: 'gateway'})
    gatewayId: number;

    @ManyToOne(type => IPObj, model => model.routeGateways)
    @JoinColumn({
        name: 'gateway'
    })
    gateway: IPObj;

    @Column({name: 'interface'})
    interfaceId: number;

    @ManyToOne(type => Interface, model => model.routes)
    @JoinColumn({
        name: 'interface'
    })
    interface: Interface;

    @Column({
        type: Boolean,
    })
    active: boolean;

    @Column()
    comment: string;

    @Column()
    style: string

    @Column({
        type: Number
    })
    route_order: number;

    @Column({
        name: 'group'
    })
    routeGroupId: number;

    @ManyToOne(type => RouteGroup, model => model.routes)
    @JoinColumn({
        name: 'group'
    })
    routeGroup: RouteGroup;

    @OneToMany(() => RouteToIPObj, model => model.route, {
        cascade: true,
    })
    routeToIPObjs: RouteToIPObj[];

    @OneToMany(() => RouteToIPObjGroup, model => model.route, {
        cascade: true,
    })
    routeToIPObjGroups: RouteToIPObjGroup[];
    
    @OneToMany(() => RouteToOpenVPN, model => model.route, {
        cascade: true,
    })
    routeToOpenVPNs: RouteToOpenVPN[];
    
    @OneToMany(() => RouteToOpenVPNPrefix, model => model.route, {
        cascade: true,
    })
    routeToOpenVPNPrefixes: RouteToOpenVPNPrefix[];

    public getTableName(): string {
        return tableName;
    }


    public static async getRouteWhichLastAddressInHost(ipobjId: number, type: number, fwcloud:number): Promise<Route[]> {
        const interfaces: Interface [] = await getRepository(Interface).createQueryBuilder('interface')
            .select('interface.id')
            .innerJoinAndSelect('interface.ipObjs', 'ipobj', 'ipobj.id = :id', {id: ipobjId})
            .innerJoin('interface.hosts', 'InterfaceIPObj')
            .innerJoin('InterfaceIPObj.hostIPObj', 'host')
            .innerJoin('host.routeToIPObjs', 'routeToIPObjs')
            .innerJoin('routeToIPObjs.route', 'route')
            .innerJoin('route.routingTable', 'table')
            .innerJoin('table.firewall', 'firewall')
            .innerJoin('firewall.fwCloud', 'fwcloud', 'fwcloud.id = :fwcloud', {fwcloud})
            .getMany();

        const uniqueInterfaces: Interface[] = [];
        for(let _interface of interfaces) {
            let addresses: IPObj[] = await Interface.getInterfaceAddr(db.getQuery(), _interface.id);

            if (addresses.length === 1 && addresses[0].id === ipobjId) {
                uniqueInterfaces.push(_interface);
            }
        }

        if (uniqueInterfaces.length === 0) {
            return [];
        }

        return await getRepository(Route)
            .createQueryBuilder('route')
            .addSelect('firewall.id', 'firewall_id').addSelect('firewall.name', 'firewall_name')
            .addSelect('cluster.id', 'cluster_id').addSelect('cluster.name', 'cluster_name')
            .innerJoin('route.routeToIPObjs', 'routeToIPObjs')
            .innerJoin('routeToIPObjs.ipObj', 'ipobj')
            .innerJoin('ipobj.hosts', 'InterfaceIPObj')
            .innerJoin('InterfaceIPObj.hostInterface', 'interface')
            .innerJoinAndSelect('route.routingTable', 'table')
            .innerJoin('table.firewall', 'firewall')
            .leftJoin('firewall.cluster', 'cluster')
            .where(`interface.id IN (${uniqueInterfaces.map(item => item.id).join(',')})`)
            .getRawMany();
    }

    public static async getRouteWhichLastAddressInHostInGroup(ipobjId: number, type: number, fwcloud:number): Promise<Route[]> {
        const interfaces: Interface [] = await getRepository(Interface).createQueryBuilder('interface')
            .select('interface.id')
            .innerJoinAndSelect('interface.ipObjs', 'ipobj', 'ipobj.id = :id', {id: ipobjId})
            .innerJoin('interface.hosts', 'InterfaceIPObj')
            .innerJoin('InterfaceIPObj.hostIPObj', 'host')
            .innerJoin('host.ipObjToIPObjGroups', 'IPObjToIPObjGroup')
            .innerJoin('IPObjToIPObjGroup.ipObjGroup', 'group')
            .innerJoin('group.routeToIPObjGroups', 'routeToIPObjGroups')
            .innerJoin('routeToIPObjGroups.route', 'route')
            .innerJoin('route.routingTable', 'table')
            .innerJoin('table.firewall', 'firewall')
            .innerJoin('firewall.fwCloud', 'fwcloud', 'fwcloud.id = :fwcloud', {fwcloud})
            .getMany();

        const uniqueInterfaces: Interface[] = [];
        for(let _interface of interfaces) {
            let addresses: IPObj[] = await Interface.getInterfaceAddr(db.getQuery(), _interface.id);

            if (addresses.length === 1 && addresses[0].id === ipobjId) {
                uniqueInterfaces.push(_interface);
            }
        }

        if (uniqueInterfaces.length === 0) {
            return [];
        }

        return await getRepository(Route)
            .createQueryBuilder('route')
            .addSelect('firewall.id', 'firewall_id').addSelect('firewall.name', 'firewall_name')
            .addSelect('cluster.id', 'cluster_id').addSelect('cluster.name', 'cluster_name')
            .innerJoin('route.routeToIPObjs', 'routeToIPObjs')
            .innerJoin('routeToIPObjs.ipObj', 'ipobj')
            .innerJoin('ipobj.hosts', 'InterfaceIPObj')
            .innerJoin('InterfaceIPObj.hostInterface', 'interface')
            .innerJoinAndSelect('route.routingTable', 'table')
            .innerJoin('table.firewall', 'firewall')
            .leftJoin('firewall.cluster', 'cluster')
            .where(`interface.id IN (${uniqueInterfaces.map(item => item.id).join(',')})`)
            .getRawMany();
    }

}