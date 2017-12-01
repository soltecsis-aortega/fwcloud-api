var express = require('express');
var router = express.Router();
var Policy_positionModel = require('../models/policy_position');
var api_resp = require('../utils/api_response');

/**
* Property Logger to manage App logs
*
* @property logger
* @type log4js/app
* 
*/
var logger = require('log4js').getLogger("app");
var objModel='Policy Position';


/* get data para crear nuevos */
router.get('/policy-position', function (req, res)
{
    res.render('new_policy_position', {title: 'Crear nuevo policy_position'});
});

/* Get all policy_positions*/
router.get('/', function (req, res)
{

    Policy_positionModel.getPolicy_positions(function (error, data)
    {
        //If exists policy_position get data
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

/* Get all policy_positions by Type*/
router.get('/type/:type', function (req, res)
{
    var p_type = req.params.type;
    Policy_positionModel.getPolicy_positionsType(p_type, function (error, data)
    {
        //If exists policy_position get data
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


/* Get  policy_position by id */
router.get('/:id', function (req, res)
{    
    var id = req.params.id;
    Policy_positionModel.getPolicy_position(id,function (error, data)
    {
        //If exists policy_position get data
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

/* Get all policy_positions by nombre */
router.get('/name/:name', function (req, res)
{
    var name = req.params.name;
    Policy_positionModel.getPolicy_positionName(name,function (error, data)
    {
        //If exists policy_position get data
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




/* Create New policy_position */
router.post("/policy-position", function (req, res)
{
    //Create New objet with data policy_position
    var policy_positionData = {
        id: req.body.id,
        name: req.body.name,
        policy_type: req.body.policy_type,
        position_order: req.body.position_order,
        content: req.body.content
                
    };
    
    Policy_positionModel.insertPolicy_position(policy_positionData, function (error, data)
    {
        //If saved policy_position Get data
        if (data && data.insertId)
        {
            //res.redirect("/policy-positions/policy-position/" + data.insertId);
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

/* Update policy_position that exist */
router.put('/policy-position/', function (req, res)
{
    //Save data into object
    var policy_positionData = {id: req.param('id'), name: req.param('name'), policy_type: req.param('policy_type'), position_order: req.param('position_order'),content: req.param('content')};
    Policy_positionModel.updatePolicy_position(policy_positionData, function (error, data)
    {
        //If saved policy_position saved ok, get data
        if (data && data.result)
        {
            //res.redirect("/policy-positions/policy-position/" + req.param('id'));            
            res.status(200).json( {"data": data.msg});
        } else
        {
            api_resp.getJson(data, api_resp.ACR_ERROR, 'Error', objModel, error, function (jsonResp) {
                            res.status(200).json(jsonResp);
                        });
        }
    });
});



/* Remove policy_position */
router.delete("/policy-position/", function (req, res)
{
    //Id from policy_position to remove
    var idfirewall = req.param('idfirewall');
    var id = req.param('id');
    Policy_positionModel.deletePolicy_positionidfirewall(idfirewall,id, function (error, data)
    {
        if (data && data.result)
        {
            //res.redirect("/policy-positions/");            
            res.status(200).json( {"data": data.msg});
        } else
        {
            api_resp.getJson(data, api_resp.ACR_ERROR, 'Error', objModel, error, function (jsonResp) {
                            res.status(200).json(jsonResp);
                        });
        }
    });
});

module.exports = router;