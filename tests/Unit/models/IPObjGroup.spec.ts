import { getRepository } from "typeorm";
import { IPObjGroup } from "../../../src/models/ipobj/IPObjGroup";
import { Route } from "../../../src/models/routing/route/route.model";
import { RouteService } from "../../../src/models/routing/route/route.service";
import { RoutingRule } from "../../../src/models/routing/routing-rule/routing-rule.model";
import { RoutingRuleService } from "../../../src/models/routing/routing-rule/routing-rule.service";
import { expect, testSuite } from "../../mocha/global-setup";
import { FwCloudFactory, FwCloudProduct } from "../../utils/fwcloud-factory";

describe.only(IPObjGroup.name, () => {
    let fwcloudProduct: FwCloudProduct;
    let route: Route;
    let ipobjGroup: IPObjGroup;
    let routingRule: RoutingRule;

    let routeService: RouteService;
    let routingRuleService: RoutingRuleService;

    beforeEach(async () => {
        fwcloudProduct = await (new FwCloudFactory()).make();
        routeService = await testSuite.app.getService<RouteService>(RouteService.name);
        routingRuleService = await testSuite.app.getService<RoutingRuleService>(RoutingRuleService.name);

        ipobjGroup = await getRepository(IPObjGroup).save(getRepository(IPObjGroup).create({
            name: 'ipobjs group',
            type: 20,
            fwCloudId: fwcloudProduct.fwcloud.id
        }));

        route = await routeService.create({
            routingTableId: fwcloudProduct.routingTable.id,
            gatewayId: fwcloudProduct.ipobjs.get('gateway').id
        })

        route = await routeService.update(route.id, {
            ipObjGroupIds: [ipobjGroup.id]
        });
        
        routingRule = await routingRuleService.create({
            routingTableId: fwcloudProduct.routingTable.id,
        });

        routingRule = await routingRuleService.update(routingRule.id, {
            ipObjGroupIds: [ipobjGroup.id]
        });
    });

    describe('searchIpobjUsage', () => {
        describe('route', () => {
            it('should detect usages', async () => {
                const whereUsed: any = await IPObjGroup.searchGroupUsage(ipobjGroup.id, fwcloudProduct.fwcloud.id);
    
                expect(whereUsed.restrictions.GroupInRoute).to.have.length(1);
                expect(whereUsed.restrictions.GroupInRoute[0].id).to.be.eq(route.id)
            })
        });

        describe('routingRule', () => {
            it('should detect usages', async () => {
                const whereUsed: any = await IPObjGroup.searchGroupUsage(ipobjGroup.id, fwcloudProduct.fwcloud.id);
    
                expect(whereUsed.restrictions.GroupInRoutingRule).to.have.length(1);
                expect(whereUsed.restrictions.GroupInRoutingRule[0].id).to.be.eq(routingRule.id)
            })
        });
    })
})