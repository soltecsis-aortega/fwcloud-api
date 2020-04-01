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

import { Application } from "../../../../../src/Application";
import { describeName, testSuite, expect } from "../../../../mocha/global-setup";
import { RouteCollection } from "../../../../../src/fonaments/http/router/route-collection";
import { RouterParser } from "../../../../../src/fonaments/http/router/router-parser";
import { Controller } from "../../../../../src/fonaments/http/controller";
import { RouterService } from "../../../../../src/fonaments/http/router/router.service";
import { Route } from "../../../../../src/fonaments/http/router/route";

class TestController extends Controller {
    public async test(request: Request) {}
}

class RouteDefinitionTest extends RouteCollection {
    public routes(router: RouterParser): void {
        router.prefix('/test', (router) => {
            router.get('/get', TestController, 'test').name('test.show');
        });
    }

}

let service: RouterService;
let routeGet: Route

describe(describeName('Router Service tests'), () => {
    beforeEach(async() => {
        service = await RouterService.make(testSuite.app);
        service.registerRoutes(RouteDefinitionTest);

        routeGet = new Route();
        routeGet.setControllerHandler({controller: TestController, method: 'test'})
            .setHttpMethod('GET')
            .setName('test.show')
            .setPathParams('/test/get');
    });


    it('getRouteByName should return a route by its name', async() => {
        expect(service.findRouteByName('test.show')).to.be.deep.equal(routeGet);
    });
})