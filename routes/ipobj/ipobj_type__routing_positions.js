var express = require('express');
var router = express.Router();
var Ipobj_type__routing_positionModel = require('../../models/ipobj/ipobj_type__routing_position');
var api_resp = require('../../utils/api_response');
var objModel='IPOBJ TYPE - R POSITION';


var logger = require('log4js').getLogger("app");


/* Get all ipobj_type__routing_positions*/
router.get('/:iduser/:fwcloud/', function (req, res)
{

    Ipobj_type__routing_positionModel.getIpobj_type__routing_positions(function (error, data)
    {
        //If exists ipobj_type__routing_position get data
        if (data && data.length > 0)
        {
            api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        }
        //Get Error
        else
        {
             api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'not found', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        }
    });
});



/* Get  ipobj_type__routing_position by id */
router.get('/:iduser/:fwcloud/:type/:position', function (req, res)
{    
    var type = req.params.type;
    var position = req.params.position;
    
    Ipobj_type__routing_positionModel.getIpobj_type__routing_position(type, position,function (error, data)
    {
        //If exists ipobj_type__routing_position get data
        if (data && data.length > 0)
        {
            api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        }
        //Get Error
        else
        {
             api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'not found', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        }
    });
});



/* Create New ipobj_type__routing_position */
router.post("/ipobj-type__routing-position/:iduser/:fwcloud/", function (req, res)
{
    //Create New objet with data ipobj_type__routing_position
    var ipobj_type__routing_positionData = {
        type: req.body.type,
        position: req.body.position,
        allowed: req.body.allowed
    };
    
    Ipobj_type__routing_positionModel.insertIpobj_type__routing_position(ipobj_type__routing_positionData, function (error, data)
    {
        //If saved ipobj_type__routing_position Get data
        if (data && data.insertId)
        {
            //res.redirect("/ipobj-type__routing-positions/ipobj-type__routing-position/" + data.insertId);
            var dataresp = {"insertId": data.insertId};
            api_resp.getJson(dataresp, api_resp.ACR_INSERTED_OK, 'INSERTED OK', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        } else
        {
            api_resp.getJson(data, api_resp.ACR_ERROR, 'Error', objModel, error, function (jsonResp) {
                            res.status(200).json(jsonResp);
                        });
        }
    });
});

/* Update ipobj_type__routing_position that exist */
router.put('/ipobj-type__routing-position/:iduser/:fwcloud/', function (req, res)
{
    //Save data into object
    var ipobj_type__routing_positionData = {        
        type: req.param('type'),
        position: req.param('position'),
        allowed: req.param('allowed')
    };
    Ipobj_type__routing_positionModel.updateIpobj_type__routing_position(ipobj_type__routing_positionData, function (error, data)
    {
        //If saved ipobj_type__routing_position saved ok, get data
        if (data && data.result)
        {
            //res.redirect("/ipobj-type__routing-positions/ipobj-type__routing-position/" + req.param('id'));
            api_resp.getJson(null, api_resp.ACR_UPDATED_OK, 'UPDATED OK', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        } else
        {
            api_resp.getJson(data, api_resp.ACR_ERROR, 'Error', objModel, error, function (jsonResp) {
                            res.status(200).json(jsonResp);
                        });
        }
    });
});



/* Remove ipobj_type__routing_position */
router.put("/del/ipobj-type__routing-position/:iduser/:fwcloud/", function (req, res)
{
    //Id from ipobj_type__routing_position to remove
    var type = req.params.type;
    var position = req.params.position;
    
    Ipobj_type__routing_positionModel.deleteIpobj_type__routing_position(type, position, function (error, data)
    {
        if (data && data.result)
        {
            //res.redirect("/ipobj-type__routing-positions/");
            api_resp.getJson(null, api_resp.ACR_UPDATED_OK, 'UPDATED OK', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        } else
        {
            api_resp.getJson(data, api_resp.ACR_ERROR, 'Error', objModel, error, function (jsonResp) {
                            res.status(200).json(jsonResp);
                        });
        }
    });
});

module.exports = router;