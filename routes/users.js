var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var api_resp = require('../utils/api_response');
var objModel='USER';

/**
* Property Logger to manage App logs
*
* @property logger
* @type log4js/app
* 
*/
var logger = require('log4js').getLogger("app");

/* Show form */
//router.get('/', function(req, res) 
//{
//  res.render('index', { title: 'Mostrando listado de Users'});
//});

/* Get all users by customer*/
router.get('/:customer', function (req, res)
{
    var customer=req.params.customer;
    UserModel.getUsers(customer,function (error, data)
    {
        //show user form
        if (data && data.length > 0)
        {
//            res.render("show_users",{ 
//                title : "Mostrando listado de Users", 
//                users : data
//            });
            api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        }
        //other we show an error
        else
        {
             api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'not found', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        }
    });
});

/* Get all users from Custormer and username*/
router.get('/:customer/username/:username', function (req, res)
{
    var customer=req.params.customer;
    var username=req.params.username;
    UserModel.getUserName(customer, username, function (error, data)
    {
        //If exists user get data
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

/* form for new users */
router.get('/user', function (req, res)
{
    res.render('new_user', {title: 'Servicio rest con nodejs, express 4 and mysql'});
});

/* new user */
router.post("/user", function (req, res)
{
    //Objet to create new user
    var userData = {
        id: null,
        customer: req.body.customer,
        username: req.body.username,
        allowed_ip: req.body.allowed_ip,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,        
        role: req.body.role        
    };
    UserModel.insertUser(userData, function (error, data)
    {
        //User created  ok
        if (data && data.insertId)
        {
            //res.redirect("/users/user/" + data.insertId);
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

/* udate user */
router.put('/user/', function (req, res)
{
    //Save user data into objet
    var userData = {id: req.param('id'), customer: req.param('customer'), username: req.param('username'), allowed_ip: req.param('allowed_ip'), name: req.param('name'), email: req.param('email'), password: req.param('password'), role: req.param('role')};
    UserModel.updateUser(userData, function (error, data)
    {
        //Message if user ok
        if (data && data.result)
        {
            //res.redirect("/users/user/" + req.param('id'));
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

/* Get User by id */
router.get('/:customer/user/:id', function (req, res)
{
     var customer=req.params.customer;
    var id = req.params.id;
    //
    if (!isNaN(id))
    {
        UserModel.getUser(customer,id, function (error, data)
        {
            //If exists show de form
            if (data && data.length > 0)
            {
                //res.render("update_user",{ 
                //    title : "", 
                //    info : data
                //});
                api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
                res.status(200).json(jsonResp);
            });

            }
            //Error
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
        res.status(500).json( {"msg": "The id must be numeric"});
    }
});




/* remove the user */
router.delete("/user/", function (req, res)
{
    //User id
    var id = req.param('id');
    UserModel.deleteUser(id, function (error, data)
    {
        if (data && data.result)
        {
            //res.redirect("/users/");
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