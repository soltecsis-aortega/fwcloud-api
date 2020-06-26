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

import { RequestValidation } from "../fonaments/validation/request-validation";
import { JoiObject, object, string, number } from "joi";
import { InstallerGenerator } from "../openvpn-installer/installer-generator";

export class CreateOpenVPNInstallerValidator extends RequestValidation {

    public rules(): JoiObject {
        return object({
            connection_name: string().required().regex(InstallerGenerator.connectionNameRegExp),
        });
    }
}