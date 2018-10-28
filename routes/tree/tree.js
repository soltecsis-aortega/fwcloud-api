var express = require('express');
var router = express.Router();
var fwcTreemodel = require('../../models/tree/tree');
//var Node = require("tree-node");
var Tree = require('easy-tree');
var fwc_tree_node = require("../../models/tree/node.js");
var utilsModel = require("../../utils/utils.js");
var api_resp = require('../../utils/api_response');
var FirewallModel = require('../../models/firewall/firewall');
var objModel = 'FWC TREE';

var logger = require('log4js').getLogger("app");

/* Get all fwc_tree NODE FIREWALL*/
router.put('/firewalls/get', (req, res) => {
	var iduser = req.iduser;
	var fwcloud = req.body.fwcloud;
	fwcTreemodel.getFwc_TreeUserFolder(iduser, fwcloud, 'FDF', (error, rows) => {
		utilsModel.checkEmptyRow(rows, notempty => {
			if (notempty) {
				var row = rows[0];
				//create object
				var root_node = new fwc_tree_node(row);
				//console.log(root_node);
				var tree = new Tree(root_node);
				fwcTreemodel.getFwc_TreeUserFull(iduser, fwcloud, root_node.id, tree, 1, 1, 'FDF',row.order_mode ,'',(error, data) =>	{                    
					if (!error) {
						// Obtain the firewalls with status!=0 and add them to the data structure.
						FirewallModel.getFirewallStatusNotZero(fwcloud,data)
						.then(data => api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, jsonResp => res.status(200).json(jsonResp)))
						.catch(error => api_resp.getJson(null, api_resp.ACR_ERROR, '', objModel, error, jsonResp => res.status(200).json(jsonResp)));
					 } else //Get Error)
						api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, jsonResp => res.status(200).json(jsonResp));
				});
			} else
				api_resp.getJson(null, api_resp.ACR_NOTEXIST, ' not found', objModel, null, jsonResp => res.status(200).json(jsonResp));
		});
	});
});

//FALTA HACER FILTRO POR NODO PADRE
//FALTA CONTROL Por CLUSTER
/* Get all fwc_tree NODE FIREWALL by IdFirewall*/
router.put('/firewall/get', 
utilsModel.checkFirewallAccess, 
(req, res) => {
	var iduser = req.iduser;
	var fwcloud = req.body.fwcloud;
	var idfirewall = req.body.idfirewall;

	fwcTreemodel.getFwc_TreeUserFolder(iduser, fwcloud, "FDF", function (error, rows)
	{
		utilsModel.checkEmptyRow(rows, function (notempty)
		{
			if (notempty) {
				var row = rows[0];
				//create object
				var root_node = new fwc_tree_node(row);
				//console.log(root_node);
				var tree = new Tree(root_node);
				fwcTreemodel.getFwc_TreeUserFull(iduser, fwcloud, root_node.id, tree, 1, 1, "FDF",row.order_mode, idfirewall, function (error, data)
				{
					//If exists fwc_tree get data
					if (!error)
					{
						api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
							res.status(200).json(jsonResp);
						});
					}
					//Get Error
					else
					{
						api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
							res.status(200).json(jsonResp);
						});
					}
				});
			} else {
				api_resp.getJson(null, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
					res.status(200).json(jsonResp);
				});
			}
		});
	});
});

/* Get all fwc_tree NODE OBJECTS by User*/
//objs -> Standar objects (without fwcloud)
//objc -> fwcloud objects
router.put('/objects/get', (req, res) => {
	var iduser = req.iduser;
	var objs = req.body.objStandard;
	var objc = req.body.objCloud;
	var fwcloud = req.body.fwcloud;

	fwcTreemodel.getFwc_TreeUserFolder(iduser, fwcloud, "FDO", function (error, rows)
	{
		if (typeof rows !== 'undefined')
		{
			var row = rows[0];

			//create object
			var root_node = new fwc_tree_node(row);
			var tree = new Tree(root_node);

			//(iduser, fwcloud, idparent, tree, objStandard, objCloud,node_type, AllDone)
			fwcTreemodel.getFwc_TreeUserFull(iduser, fwcloud, root_node.id, tree, objs, objc, "FDO",row.order_mode, '', function (error, data)
			{
				//If exists fwc_tree get data
				if (!error)
				{
					api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
				//Get Error
				else
				{
					api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
			});
		}
		//Get Error
		else
		{
			api_resp.getJson(null, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Get fwc_tree NODE OBJECTS by User and by ID*/
//objs -> Standar objects (without fwcloud)
//objc -> fwcloud objects
router.put('/objects/node/get', (req, res) => {
	var iduser = req.iduser;
	var objs = req.body.objStandard;
	var objc = req.body.objCloud;
	var idNode = req.body.id;
	var fwcloud = req.body.fwcloud;

	fwcTreemodel.getFwc_TreeId(iduser, fwcloud, idNode, function (error, rows)
	{

		if (typeof rows !== 'undefined' && rows !== null && rows.length > 0)
		{
			var row = rows[0];
			//create object
			var root_node = new fwc_tree_node(row);
			var tree = new Tree(root_node);
			fwcTreemodel.getFwc_TreeUserFull(iduser, fwcloud, root_node.id, tree, objs, objc, "FDO",row.order_mode, '', function (error, data)
			{
				//If exists fwc_tree get data
				if (!error)
				{
					api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
				//Get Error
				else
				{
					api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
			});
		}
		//Get Error
		else
		{
			api_resp.getJson(null, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Get all fwc_tree NODE SERVICES by User*/
//objs -> Standar services (without fwcloud)
//objc -> fwcloud services
router.put('/services/get', (req, res) => {
	var iduser = req.iduser;
	var objs = req.body.objStandard;
	var objc = req.body.objCloud;
	var fwcloud = req.body.fwcloud;

	fwcTreemodel.getFwc_TreeUserFolder(iduser, fwcloud, "FDS", function (error, rows)
	{
		if (typeof rows !== 'undefined')
		{
			var row = rows[0];
			//create object
			var root_node = new fwc_tree_node(row);
			var tree = new Tree(root_node);
			fwcTreemodel.getFwc_TreeUserFull(iduser, fwcloud, root_node.id, tree, objs, objc, "FDS",row.order_mode, '', function (error, data)
			{
				//If exists fwc_tree get data
				if (!error)
				{
					api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
				//Get Error
				else
				{
					api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
			});
		}
		//Get Error
		else
		{
			api_resp.getJson(null, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Get all fwc_tree NODE SERVICES by User and ID NODE*/
//objs -> Standar services (without fwcloud)
//objc -> fwcloud services
router.put('/services/node/get', (req, res) => {
	var iduser = req.iduser;
	var objs = req.body.objStandard;
	var objc = req.body.objCloud;
	var idNode = req.body.id;
	var fwcloud = req.body.fwcloud;

	fwcTreemodel.getFwc_TreeId(iduser, fwcloud, idNode, function (error, rows)
	{
		if (typeof rows !== 'undefined')
		{
			var row = rows[0];
			//create object
			var root_node = new fwc_tree_node(row);
			var tree = new Tree(root_node);
			fwcTreemodel.getFwc_TreeUserFull(iduser, fwcloud, root_node.id, tree, objs, objc, "FDS",row.order_mode, '', function (error, data)
			{
				//If exists fwc_tree get data
				if (!error)
				{
					api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
				//Get Error
				else
				{
					api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
			});
		}
		//Get Error
		else
		{
			api_resp.getJson(null, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Get  fwc_tree by id  */
router.put('/get', (req, res) => {
	var iduser = req.iduser;
	var id = req.body.id;
	var fwcloud = req.body.fwcloud;

	fwcTreemodel.getFwc_TreeId(iduser, fwcloud, id, function (error, data)
	{
		//If exists fwc_tree get data
		if (data && data.length > 0)
		{
			api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
		//Get Error
		else
		{
			api_resp.getJson(data, api_resp.ACR_NOTEXIST, ' not found', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Create New fwc_tree Firewall node*/
router.post("/firewall", (req, res) => {
	fwcTreemodel.insertFwc_Tree_firewalls(req.body.fwcloud, "FDF",'', function (error, data)
	{
		//If saved fwc-tree Get data
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_INSERTED_OK, 'INSERTED OK', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Create New fwc_tree Objects*/
router.post("/create-objects/user/:iduser/fwc/:fwcloud", function (req, res)
{
	var iduser = req.iduser;
	var fwcloud = req.fwcloud;
	fwcTreemodel.insertFwc_Tree_objects(fwcloud, "FDO", function (error, data)
	{
		//If saved fwc-tree Get data
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_INSERTED_OK, 'INSERTED OK', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Create New fwc_tree Services*/
router.put("/create-services/user", function (req, res)
{
	var iduser = req.iduser;
	var fwcloud = req.fwcloud;
	fwcTreemodel.insertFwc_Tree_objects(fwcloud, "FDS", function (error, data)
	{
		//If saved fwc-tree Get data
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_INSERTED_OK, 'INSERTED OK', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

//FALTA AÑADIR CONTROL ACCESO ADMIN
/* Create ALL nodes*/
router.put("/create-ALL/user", function (req, res)
{
	var iduser = req.iduser;
	var fwcloud = req.fwcloud;
	//AÑADIR CONTROL de ACCESO de USUARIO a FWCLOUD

	logger.debug("------------- CREATING FWCTREE INIT");
	fwcTreemodel.insertFwc_Tree_init(fwcloud, function (error, data)
	{
		//If saved fwc-tree Get data
		if (data && data.result)
		{
			logger.debug("------------- CREATING FWCTREE FIREWALLS");
			fwcTreemodel.insertFwc_Tree_firewalls(fwcloud, "FDF",'', function (error, data)
			{
				//If saved fwc-tree Get data
				if (data && data.result)
				{
					logger.debug("------------- CREATING FWCTREE OBJECTS");
					fwcTreemodel.insertFwc_Tree_objects(fwcloud, "FDO", function (error, data)
					{
						//If saved fwc-tree Get data
						if (data && data.result)
						{
							logger.debug("------------- CREATING FWCTREE SERVICES");
							fwcTreemodel.insertFwc_Tree_objects(fwcloud, "FDS", function (error, data)
							{
								//If saved fwc-tree Get data
								if (data && data.result)
								{
									api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
										res.status(200).json(jsonResp);
									});
								} else
								{
									api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
										res.status(200).json(jsonResp);
									});
								}
							});
						} else
						{
							api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
								res.status(200).json(jsonResp);
							});
						}
					});
				} else
				{
					api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
			});
		}
	});
});

router.put("/order/ipobj/:id_obj", function (req, res)
{
	var iduser = req.iduser;
	var fwcloud = req.fwcloud;
	var id_obj = req.params.id_obj;

	fwcTreemodel.orderTreeNodeDeleted(fwcloud, id_obj, function (error, data)
	{
		//If saved fwc_tree saved ok, get data
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'Error', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

router.put("/order/parent/:id_parent", function (req, res)
{
	var iduser = req.iduser;
	var fwcloud = req.fwcloud;
	var id_parent = req.params.id_parent;

	fwcTreemodel.orderTreeNode(fwcloud, id_parent, function (error, data)
	{
		//If saved fwc_tree saved ok, get data
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_OK, '', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_NOTEXIST, 'Error', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});


///FALTA ACABAR
/* Update fwc_tree that exist */
router.put('/fwc-tree/', function (req, res)
{
	//Save data into object
	var fwc_treeData = {id: req.param('id'), fwcloud: req.param('fwcloud'), interface: req.param('interface'), name: req.param('name'), type: req.param('type'), protocol: req.param('protocol'), address: req.param('address'), netmask: req.param('netmask'), diff_serv: req.param('diff_serv'), ip_version: req.param('ip_version'), code: req.param('code'), tcp_flags_mask: req.param('tcp_flags_mask'), tcp_flags_settings: req.param('tcp_flags_settings'), range_start: req.param('range_start'), range_end: req.param('range_end'), source_port_start: req.param('source_port_start'), source_port_end: req.param('source_port_end'), destination_port_start: req.param('destination_port_start'), destination_port_end: req.param('destination_port_end'), options: req.param('options'), comment: req.param('comment')};
	fwcTreemodel.updateIpobj(fwc_treeData, function (error, data)
	{
		//If saved fwc_tree saved ok, get data
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_UPDATED_OK, '', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_ERROR, 'Error updating', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

//FALTA ACABAR
/* Remove fwc_tree */
router.put("/del/fwc-tree/", function (req, res)
{
	//Id from fwc_tree to remove
	var idfirewall = req.param('idfirewall');
	var id = req.param('id');
	fwcTreemodel.deleteIpobj(idfirewall, id, function (error, data)
	{
		if (data && data.result)
		{
			api_resp.getJson(data, api_resp.ACR_UPDATED_OK, '', objModel, null, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		} else
		{
			api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, error, function (jsonResp) {
				res.status(200).json(jsonResp);
			});
		}
	});
});

/* Remove fwc_tree */
router.put("/del/fwc-tree/:idnode", function (req, res)
{
	//Id from fwc_tree to remove    
	var id = req.params.idnode;
	var dataNode = {id: id, fwcloud: req.fwcloud, iduser: req.iduser};
	logger.debug(dataNode);
	
	fwcTreemodel.deleteFwc_TreeFullNode(dataNode)
			.then(data =>
			{
				if (data && data.result)
				{
					api_resp.getJson(data, api_resp.ACR_UPDATED_OK, '', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				} else
				{
					api_resp.getJson(data, api_resp.ACR_ERROR, 'Error inserting', objModel, null, function (jsonResp) {
						res.status(200).json(jsonResp);
					});
				}
			});
});

module.exports = router;