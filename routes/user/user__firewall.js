var express = require('express');
var router = express.Router();
var User__firewallModel = require('../../models/user/user__firewall');
var api_resp = require('../../utils/api_response');
var objModel = 'USER FIREWALL';


var logger = require('log4js').getLogger("app");


/* Get cloud list allowed access  */
router.get('/:id_user', function (req, res)
{
    var id_user = req.params.id_user;

    logger.debug("GETTING USER CLOUD LIST");
    if (!isNaN(id_user))
    {
        User__firewallModel.getUser__firewall_clouds(id_user, function (error, data)
        {
            //If exists user__firewall get data
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
    }
    //Id must be numeric
    else
    {
        res.status(500).json({"msg": "The id must be numeric"});
    }
});


/* Get all firewalls from user and cloud */
router.get('/:id_user/:fwcloud', function (req, res)
{
    var id_user = req.params.id_user;
    var fwcloud = req.body.fwcloud;
    var access = 1;

    logger.debug("GETTING USER FIREWALL LIST");
    User__firewallModel.getUser__firewalls(id_user, fwcloud, access, function (error, data)
    {
        //If exists user__firewall get data
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

/* Get firewall from user, cloud and firewall */
router.get('/:id_user/:fwcloud/:idfirewall', function (req, res)
{
    var id_user = req.params.id_user;
    var fwcloud = req.body.fwcloud;
    var idfirewall = req.params.idfirewall;
    var access = 1;

    logger.debug("GETTING USER FIREWALL BY ID");
    User__firewallModel.getUser__firewall(id_user, fwcloud, idfirewall, access, function (error, data)
    {
        //If exists user__firewall get data
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



/* Create New user__firewall */
router.post("/user__firewall", function (req, res)
{
    //Create New objet with data user__firewall
    var user__firewallData = {
        id_user: req.body.id_user,
        id_firewall: req.body.id_firewall
    };
    User__firewallModel.insertUser__firewall(user__firewallData, function (error, data)
    {
        if (error)
            api_resp.getJson(data, api_resp.ACR_ERROR, 'SQL ERRROR', '', error, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        else {
            //If saved user__firewall Get data
            if (data && data.insertId)
            {
                //res.redirect("/user__firewalls/user__firewall/" + data.insertId);
                var dataresp = {"insertId": data.insertId};
                api_resp.getJson(dataresp, api_resp.ACR_INSERTED_OK, 'INSERTED OK', objModel, null, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            } else
            {
                api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'not found', objModel, null, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            }
        }
    });
});

/* Update user__firewall that exist */
router.put('/user__firewall/', function (req, res)
{
    //Save data into object
    var user__firewallData = {id_user: req.param('id_user'), id_firewall: req.param('id_firewall')};
    User__firewallModel.updateUser__firewall(user__firewallData, function (error, data)
    {
        if (error)
            api_resp.getJson(data, api_resp.ACR_ERROR, 'SQL ERRROR', '', error, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        else {
            //If saved user__firewall saved ok, get data
            if (data && data.result)
            {
                //res.redirect("/user__firewalls/user__firewall/" + req.param('id'));
                api_resp.getJson(null, api_resp.ACR_UPDATED_OK, 'UPDATED OK', objModel, null, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            } else
            {
                api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'not found', objModel, null, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            }
        }
    });
});



/* Remove user__firewall */
router.put("/del/user__firewall/", function (req, res)
{
    var id_user = req.params.id_user;
    var id_firewall = req.params.id_firewall;
    User__firewallModel.deleteUser__firewall(id_user, id_firewall)
            .then(data =>
            {
                if (data && data.result)
                {
                    //res.redirect("/user__firewalls/");
                    api_resp.getJson(null, api_resp.ACR_UPDATED_OK, 'DELETED OK', objModel, null, function (jsonResp) {
                        res.status(200).json(jsonResp);
                    });
                } else
                {
                    api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'not found', objModel, null, function (jsonResp) {
                        res.status(200).json(jsonResp);
                    });
                }


            })
            .catch(error => {
                api_resp.getJson(data, api_resp.ACR_ERROR, 'SQL ERRROR', '', error, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            });
});

module.exports = router;