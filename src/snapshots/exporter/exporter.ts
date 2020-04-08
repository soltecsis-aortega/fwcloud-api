/*!
    Copyright 2019 SOLTECSIS SOLUCIONES TECNOLOGICAS, SLU
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

import { Connection } from "typeorm";
import { DatabaseService } from "../../database/database.service";
import { app } from "../../fonaments/abstract-application";
import { FwCloudExporter } from "./fwcloud-exporter";
import { TableExporter, TableExporterResults } from "./table-exporter";
import ObjectHelpers from "../../utils/object-helpers";
import { FirewallExporter } from "./firewall.exporter";
import { CaExporter } from "./ca.exporter";
import { CaPrefixExporter } from "./ca-prefix.exporter";
import { ClusterExporter } from "./cluster.exporter";
import { CrtExporter } from "./crt.exporter";
import { InterfaceExporter } from "./interface.exporter";
import { IPObjExporter } from "./ipobj.exporter";
import { IPObjToIPObjGroupExporter } from "./ipobj-to-ipobj-group.exporter";
import { IPObjGroupExporter } from "./ipobj-group.exporter";
import { MarkExporter } from "./mark.exporter";
import { OpenVPNExporter } from "./openvpn.exporter";
import { OpenVPNOptionsExporter } from "./openvpn-options.exporter";
import { OpenVPNPrefixExporter } from "./openvpn-prefix.exporter";
import { PolicyGroupExporter } from "./policy-group.exporter";
import { PolicyRuleExporter } from "./policy-rule.exporter";
import { InterfaceToIPObjExporter } from "./interface-to-ipobj.exporter";
import { PolicyRuleToInterfaceExporter } from "./policy-rule-to-interface.exporter";
import { PolicyRuleToIPObjExporter } from "./policy-rule-to-ipobj.exporter";
import { PolicyRuleToOpenVPNExporter } from "./policy-rule-to-openvpn.exporter";
import { PolicyRuleToOpenVPNPrefixExporter } from "./policy-rule-to-openvpn-prefix.exporter";
import { OpenVPNToIPObjGroupExporter } from "./openvpn-to-ipobj-group.exporter";
import { OpenVPNPrefixToIPObjGroupExporter } from "./openvpn-prefix-to-ipobj-group.exporter";
import { FwcTreeExporter } from "./fwc-tree.exporter";

const EXPORTERS = [
    new CaExporter(),
    new CaPrefixExporter(),
    new ClusterExporter(),
    new CrtExporter(),
    new FirewallExporter(),
    new FwCloudExporter(),
    new InterfaceToIPObjExporter(),
    new InterfaceExporter(),
    new IPObjGroupExporter(),
    new IPObjToIPObjGroupExporter(),
    new IPObjExporter(),
    new MarkExporter(),
    new OpenVPNOptionsExporter(),
    new OpenVPNPrefixExporter(),
    new OpenVPNExporter(),
    new OpenVPNPrefixToIPObjGroupExporter(),
    new PolicyGroupExporter(),
    new PolicyRuleToInterfaceExporter(),
    new PolicyRuleToIPObjExporter(),
    new PolicyRuleToOpenVPNPrefixExporter(),
    new PolicyRuleToOpenVPNExporter(),
    new PolicyRuleExporter(),
    new OpenVPNToIPObjGroupExporter(),
    new FwcTreeExporter()
];

export class Exporter {
    protected _result: TableExporterResults;

    public async export(fwcloudId: number): Promise<TableExporterResults> {
        const databaseService: DatabaseService = await app().getService<DatabaseService>(DatabaseService.name);
        const connection: Connection = databaseService.connection;
        this._result = {};

        for(let i = 0; i < EXPORTERS.length; i++) {
            const exporter: TableExporter = EXPORTERS[i];
            const data = await exporter.export(connection, fwcloudId);
            this._result = <TableExporterResults>ObjectHelpers.merge(this._result, data);
        }


        return this._result;
    }
}