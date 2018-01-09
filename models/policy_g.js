var db = require('../db.js');


//create object
var policy_cModel = {};
var tableModel = "policy_c";


var logger = require('log4js').getLogger("app");

//Get All policy_c by firewall
policy_cModel.getPolicy_cs = function (idfirewall, callback) {

    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'SELECT * FROM ' + tableModel + ' WHERE firewall=' + connection.escape(idfirewall) + ' ORDER BY id';
        connection.query(sql, function (error, rows) {
            if (error)
                callback(error, null);
            else
                callback(null, rows);
        });
    });
};

//Get All policy_c by firewall and group father
policy_cModel.getPolicy_cs_group = function (idfirewall, idgroup, callback) {

    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'SELECT * FROM ' + tableModel + ' WHERE firewall=' + connection.escape(idfirewall) + ' AND idgroup=' + connection.escape(idgroup) + ' ORDER BY id';
        connection.query(sql, function (error, rows) {
            if (error)
                callback(error, null);
            else
                callback(null, rows);
        });
    });
};



//Get policy_c by  id and firewall
policy_cModel.getPolicy_g = function (idfirewall, id, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'SELECT * FROM ' + tableModel + ' WHERE id = ' + connection.escape(id) + ' AND firewall=' + connection.escape(idfirewall);
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};

//Get routing by name and firewall
policy_cModel.getPolicy_gName = function (idfirewall, name, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var namesql = '%' + name + '%';
        var sql = 'SELECT * FROM ' + tableModel + ' WHERE name like  ' + connection.escape(namesql) + ' AND  firewall=' + connection.escape(idfirewall);
        
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};



//Add new policy_c from user
policy_cModel.insertPolicy_g = function (policy_cData, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sqlExists = 'SELECT * FROM ' + tableModel + '  WHERE id = ' + connection.escape(policy_cData.id) + ' AND firewall=' + connection.escape(policy_cData.firewall);
        
        connection.query(sqlExists, function (error, row) {                        
            if (row &&  row.length>0) {
                logger.debug("GRUPO Existente: " + policy_cData.id );
                callback(null, {"insertId": policy_cData.id});

            } else {
                sqlInsert='INSERT INTO ' + tableModel + ' SET firewall=' + policy_cData.firewall + ", name=" +  connection.escape(policy_cData.name) + ", comment=" + connection.escape(policy_cData.comment);
                connection.query(sqlInsert, function (error, result) {
                    if (error) {
                        callback(error, null);
                    } else {
                        //devolvemos la última id insertada
                        logger.debug("CREADO nuevo GRUPO: " + result.insertId );
                        callback(null, {"insertId": result.insertId});
                    }
                });
            }
        });
    });
};

//Update policy_c from user
policy_cModel.updatePolicy_g = function (policy_cData, callback) {

    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'UPDATE ' + tableModel + ' SET name = ' + connection.escape(policy_cData.name) + ',' +
                'firewall = ' + connection.escape(policy_cData.firewall) + ',' +
                'comment = ' + connection.escape(policy_cData.comment) + ' ' +
                ' WHERE id = ' + policy_cData.id;
        logger.debug(sql);
        connection.query(sql, function (error, result) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, {"result": true});
            }
        });
    });
};

//Remove policy_c with id to remove
//FALTA BORRADO EN CASCADA 
policy_cModel.deletePolicy_g = function (idfirewall, id, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sqlExists = 'SELECT * FROM ' + tableModel + '  WHERE id = ' + connection.escape(id) + ' AND firewall=' + connection.escape(idfirewall);
        connection.query(sqlExists, function (error, row) {
            //If exists Id from policy_c to remove
            if (row) {
                db.get(function (error, connection) {
                    var sql = 'DELETE FROM ' + tableModel + ' WHERE id = ' + connection.escape(id);
                    connection.query(sql, function (error, result) {
                        if (error) {
                            callback(error, null);
                        } else {
                            callback(null, {"result": true, "msg": "deleted"});
                        }
                    });
                });
            } else {
                callback(null, {"result": false});
            }
        });
    });
};

//Export the object
module.exports = policy_cModel;