var db = require('../db.js');

/**
* Module to manage Firewalls data
*
* @module Firewall
* 
* @requires db
* 
*/

/**
* Class to manage firewalls data
*
* @class FirewallModel
* @uses db
* 
*/
var firewallModel = {};

/**
* Property Table
*
* @property tableModel
* @type "firewall"
* @private
* 
*/
var tableModel = "firewall";



var logger = require('log4js').getLogger("app");


/**
* Get Firewalls by User
*  
* @method getFirewalls
* 
* @param {Integer} iduser User identifier
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {ARRAY of Firewall objects} Returns `ARRAY OBJECT FIREWALL DATA` 
* 
* Table: __firewall__
* 
*           id	int(11) AI PK
*           cluster	int(11)
*           fwcloud	int(11)
*           name	varchar(255)
*           comment	longtext
*           created_at	datetime
*           updated_at	datetime
*           by_user	int(11)
*           id_fwb	varchar(45)
*/
firewallModel.getFirewalls = function (iduser, callback) {

    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'SELECT T.* FROM ' + tableModel + ' T INNER JOIN user__firewall U ON T.id=U.id_firewall AND U.id_user=' + connection.escape(iduser) + ' ORDER BY id';
        logger.debug(sql);
        connection.query(sql, function (error, rows) {
            if (error)
                callback(error, null);
            else
                callback(null, rows);
        });
    });
};



/**
* Get Firewalls by User and ID
*  
* @method getFirewall
* 
* @param {Integer} iduser User identifier
* @param {Integer} id firewall identifier
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {Firewall object} Returns `OBJECT FIREWALL DATA` 
* 
* Table: __firewall__
* 
*           id	int(11) AI PK
*           cluster	int(11)
*           fwcloud	int(11)
*           name	varchar(255)
*           comment	longtext
*           created_at	datetime
*           updated_at	datetime
*           by_user	int(11)
*           id_fwb	varchar(45)
*/
firewallModel.getFirewall = function (iduser, id, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'SELECT T.* FROM ' + tableModel + ' T INNER JOIN user__firewall U ON T.id=U.id_firewall AND U.id_user=' + connection.escape(iduser) + ' WHERE id = ' + connection.escape(id);
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};

/**
* Get Firewalls by User and Name
*  
* @method getFirewallName
* 
* @param {Integer} iduser User identifier
* @param {String} Name Firewall Name
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {ARRAY of Firewall objects} Returns `ARRAY OBJECT FIREWALL DATA` 
* 
* Table: __firewall__
* 
*           id	int(11) AI PK
*           cluster	int(11)
*           fwcloud	int(11)
*           name	varchar(255)
*           comment	longtext
*           created_at	datetime
*           updated_at	datetime
*           by_user	int(11)
*           id_fwb	varchar(45)
*/
firewallModel.getFirewallName = function (iduser, name, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var namesql = '%' + name + '%';
        var sql = 'SELECT T.* FROM ' + tableModel + ' T INNER JOIN user__firewall U ON T.id=U.id_firewall AND U.id_user=' + connection.escape(iduser) + ' WHERE name like  ' + connection.escape(namesql) + '';
        logger.debug(sql);
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};

/**
* Get Firewalls by User and Cluster
*  
* @method getFirewallCluster
* 
* @param {Integer} iduser User identifier
* @param {Integer} idcluster Cluster identifier
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {ARRAY of Firewall objects} Returns `ARRAY OBJECT FIREWALL DATA` 
* 
* Table: __firewall__
* 
*           id	int(11) AI PK
*           cluster	int(11)
*           fwcloud	int(11)
*           name	varchar(255)
*           comment	longtext
*           created_at	datetime
*           updated_at	datetime
*           by_user	int(11)
*           id_fwb	varchar(45)
*/
firewallModel.getFirewallCluster = function (iduser, idcluster, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);        
        var sql = 'SELECT T.* FROM ' + tableModel + ' T INNER JOIN user__firewall U ON T.id=U.id_firewall AND U.id_user=' + connection.escape(iduser) + ' WHERE cluster =  ' + connection.escape(idcluster) + '';
        logger.debug(sql);
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};


/**
* ADD New Firewall
*  
* @method insertFirewall
* 
* @param iduser {Integer}  User identifier
* @param firewallData {Firewall Object}  Firewall Object data
*       @param firewallData.id {NULL} 
*       @param firewallData.cluster {Integer} Cluster ID
*       @param firewallData.fwcloud {Integer} FWcloud ID
*       @param firewallData.name {string} Firewall Name
*       @param [firewallData.comment] {String}  comment text 
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {CALLBACK RESPONSE}
* 
* @example
* #### RESPONSE OK:
*    
*       callback(null, {"insertId": fwid});
*       
* #### RESPONSE ERROR:
*    
*       callback(error, null);
*       
*/
firewallModel.insertFirewall = function (iduser, firewallData, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        connection.query('INSERT INTO ' + tableModel + ' SET ?', firewallData, function (error, result) {
            if (error) {
                callback(error, null);
            } else {
                var fwid=result.insertId;
                connection.query('INSERT INTO  user__firewall  SET id_firewall=' +  connection.escape(fwid) + ' , id_user=' +  connection.escape(iduser), function (error, result) {
                    if (error) {
                        callback(error, null);
                    } else {
                        //devolvemos la última id insertada
                        callback(null, {"insertId": fwid});
                    }
                });
            }
        });
    });
};

/**
* UPDATE Firewall
*  
* @method updateFirewall
* 
* @param iduser {Integer}  User identifier
* @param firewallData {Firewall Object}  Firewall Object data
*       @param firewallData.id {NULL} 
*       @param firewallData.cluster {Integer} Cluster ID
*       @param firewallData.fwcloud {Integer} FWcloud ID
*       @param firewallData.name {string} Firewall Name
*       @param [firewallData.comment] {String}  comment text 
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {CALLBACK RESPONSE}
* 
* @example
* #### RESPONSE OK:
*    
*       callback(null, {"result": true});
*       
* #### RESPONSE ERROR:
*    
*       callback(error, null);
*       
*/
firewallModel.updateFirewall = function (firewallData, callback) {

    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sql = 'UPDATE ' + tableModel + ' SET name = ' + connection.escape(firewallData.name) + ',' +
                'cluster = ' + connection.escape(firewallData.cluster) + ',' +                
                'comment = ' + connection.escape(firewallData.comment) + ' ' +
                ' WHERE id = ' + firewallData.id;
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

/**
* DELETE Firewall
*  
* @method deleteFirewall
* 
* @param iduser {Integer}  User identifier
* @param id {Integer}  Firewall identifier
* @param {Function} callback    Function callback response
* 
*       callback(error, Rows)
* 
* @return {CALLBACK RESPONSE}
* 
* @example
* #### RESPONSE OK:
*    
*       callback(null, {"result": true, "msg": "deleted"});
*       
* #### RESPONSE ERROR:
*    
*       callback(null, {"result": false});
*       
*/
firewallModel.deleteFirewall = function (iduser, id, callback) {
    db.get(function (error, connection) {
        if (error)
            callback(error, null);
        var sqlExists = 'SELECT T.* FROM ' + tableModel + ' T INNER JOIN user__firewall U ON T.id=U.id_firewall AND U.id_user=' + connection.escape(iduser) + ' WHERE id = ' + connection.escape(id);
        connection.query(sqlExists, function (error, row) {
            //If exists Id from firewall to remove
            if (row) {
                db.get(function (error, connection) {
                    var sql = 'DELETE FROM ' + tableModel + ' WHERE id = ' + connection.escape(id);
                    connection.query(sql, function (error, result) {
                        if (error) {
                            callback(error, null);
                        } else {
                            var sql = 'DELETE FROM use_firewall WHERE id_firewall = ' + connection.escape(id) + ' AND id_user=' + connection.escape(iduser);
                            connection.query(sql, function (error, result) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, {"result": true, "msg": "deleted"});
                                }
                            });
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
module.exports = firewallModel;