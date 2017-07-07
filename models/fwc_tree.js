var db = require('../db.js');
var async = require('async');


//create object
var fwc_treeModel = {};


var tableModel = "fwc_tree";
//var Node = require("tree-node");
var Tree = require('easy-tree');
var fwc_tree_node = require("./fwc_tree_node.js");


//Get fwc_tree by  id 
fwc_treeModel.getFwc_TreeId = function (iduser, id, callback) {
    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

        var sql = 'SELECT * FROM ' + tableModel + ' WHERE id = ' + connection.escape(id);
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};

//Get FLAT TREE by user
fwc_treeModel.getFwc_TreeUser = function (iduser, callback) {

    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

        var sql = 'SELECT * FROM ' + tableModel + ' WHERE  id_user=' + connection.escape(iduser) + ' ORDER BY id_parent,node_order';
        console.log(sql);
        connection.query(sql, function (error, rows) {
            if (error)
                callback(error, null);
            else
                callback(null, rows);
        });
    });
};

//Get firewall node Id
fwc_treeModel.getFwc_TreeUserFolder = function (iduser, foldertype, callback) {

    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

        var sql = 'SELECT * FROM ' + tableModel + ' WHERE  id_user=' + connection.escape(iduser) + '  AND node_type=' + connection.escape(foldertype) + ' AND id_parent=0 ORDER BY id limit 1';
        console.log(sql);
        connection.query(sql, function (error, rows) {
            if (error)
                callback(error, null);
            else
                callback(null, rows);
        });
    });
};
//Get COMPLETE TREE by user
fwc_treeModel.getFwc_TreeUserFull = function (iduser, idparent, tree ,objs, objc , AllDone) {

    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

            //FALTA CONTROLAR EN QUE FWCLOUD ESTA EL USUARIO
        var sqlfwcloud="";
         if (objs==='1' &&  objc==='0')
             sqlfwcloud= " AND (fwcloud is null OR id_obj is null) ";   //Only Standard objects
         else if (objs==='0' &&  objc==='1')
             sqlfwcloud= " AND (fwcloud is not null OR id_obj is null) ";   //Only fwcloud objects
             
         
        //Get ALL CHILDREN NODES FROM idparent
        var sql = 'SELECT * FROM ' + tableModel + ' WHERE  id_user=' + connection.escape(iduser) + ' AND id_parent=' + connection.escape(idparent) + sqlfwcloud + ' ORDER BY node_order';
        console.log(sql);
        connection.query(sql, function (error, rows) {
            if (error)
                callback(error, null);
            else {

                if (rows) {
                    console.log("---> DENTRO de PADRE: " + idparent);

                    async.forEachSeries(rows,
                            function (row, callback) {
                                hasLines(row.id, function (t) {
                                    //console.log(row);
                                    var tree_node = new fwc_tree_node(row);
                                    if (!t) {
                                        //Añadimos nodo hijo

                                        console.log("--->  AÑADIENDO NODO FINAL " + row.id + " con PADRE: " + idparent);

                                        tree.append([], tree_node);

                                        callback();
                                    } else {
                                        //dig(row.tree_id, treeArray, callback);
                                        console.log("--->  AÑADIENDO NODO PADRE " + row.id + " con PADRE: " + idparent);
                                        console.log("-------> LLAMANDO A HIJO: " + row.id);

                                        var treeP = new Tree(tree_node);
                                        tree.append([], treeP);
                                        fwc_treeModel.getFwc_TreeUserFull(iduser, row.id, treeP, objs, objc ,callback);
                                    }
                                });
                            },
                            function (err) {
                                if (err)
                                    AllDone(err, tree);
                                else
                                    AllDone(null, tree);
                            });
                } else
                    AllDone(null, tree);
            }
        });

    });
};

//Get TREE by User and Parent
fwc_treeModel.getFwc_TreeUserParent = function (iduser, idparent, callback) {
    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

        var sql = 'SELECT * FROM ' + tableModel + ' WHERE id_user = ' + connection.escape(iduser) + ' AND id_parent=' + connection.escape(idparent);
        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};

//Get NODES by name 
fwc_treeModel.getFwc_TreeName = function (iduser, name, callback) {
    db.get(function (error, connection) {
        if (error)
            return done('Database problem');
        var namesql = '%' + name + '%';

        var sql = 'SELECT * FROM ' + tableModel + ' WHERE id_user = ' + connection.escape(iduser) + " AND name like " + connection.escape(namesql);

        connection.query(sql, function (error, row) {
            if (error)
                callback(error, null);
            else
                callback(null, row);
        });
    });
};


//Add new TREE OBJECTS from user
fwc_treeModel.insertFwc_Tree_objects = function (iduser, folder, AllDone) {
    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

        //Select Parent Node by type   
        sql='SELECT T1.* FROM ' + tableModel + ' T1 inner join fwc_tree T2 on T1.id_parent=T2.id where T2.node_type=' + connection.escape(folder) +' and T2.id_parent=0 AND T1.id_user=' + connection.escape(iduser) + ' order by T1.node_order';
        console.log(sql);
        connection.query(sql,
                function (error, rows) {
                    if (error) {
                        callback(error, null);
                    } else {
                        //For each node Select Objects by  type
                        if (rows) {
                            async.forEachSeries(rows,
                                    function (row, callback) {
                                        //console.log(row);
                                        console.log("---> DENTRO de NODO: " + row.name + " - " + row.node_type);
                                        var tree_node = new fwc_tree_node(row);
                                        //Añadimos nodos hijos del tipo
                                        sqlnodes = 'SELECT  id,name,type,fwcloud, comment FROM ipobj  where type=' + row.obj_type + ' AND interface is null';
                                        //console.log(sqlnodes);
                                        connection.query(sqlnodes, function (error, rowsnodes) {
                                            if (error)
                                                callback(error, null);
                                            else {
                                                var i = 0;
                                                if (rowsnodes) {
                                                    async.forEachSeries(rowsnodes,
                                                            function (rnode, callback) {
                                                                i++;
                                                                //Insertamos nodo
                                                                sqlinsert = 'INSERT INTO ' + tableModel +
                                                                        '(id_user, name, comment, id_parent, node_order,node_level, node_type, expanded, `subfolders`, id_obj,obj_type,fwcloud) ' +
                                                                        ' VALUES (' + 
                                                                        connection.escape(iduser) + ',' + connection.escape(rnode.name) + ',' +
                                                                        connection.escape(rnode.comment) + ',' + connection.escape(row.id) + ',' +
                                                                        i + ',' + (row.node_level+1) + ',' + connection.escape(row.node_type) + ',' +
                                                                        '0,0,' + connection.escape(rnode.id) + ',' + connection.escape(rnode.type) + ',' +
                                                                        connection.escape(rnode.fwcloud) + ")";
                                                                //console.log(sqlinsert);
                                                                connection.query(sqlinsert, function (error, result) {
                                                                    if (error) {
                                                                        console.log("ERROR INSERT : " + rnode.id + " - " + rnode.name + " -> " + error);

                                                                    } else {
                                                                        console.log("INSERT OK NODE: " + rnode.id + " - " + rnode.name);

                                                                    }
                                                                });
                                                                callback();
                                                            }

                                                    );
                                                }
                                            }
                                        });


                                        callback();
                                    },
                                    function (err) {
                                        if (err)
                                            AllDone(err, null);
                                        else
                                            AllDone(null,{"msg": "ok"} );
                                    });
                        } else
                            AllDone(null, {"msg": "ok"});
                    }
                });
    });
};

//Add new NODE from user
fwc_treeModel.insertFwc_Tree = function (fwc_treeData, callback) {
    db.get(function (error, connection) {
        if (error)
            return done('Database problem');
        connection.query('INSERT INTO ' + tableModel + ' SET ?', fwc_treeData, function (error, result) {
            if (error) {
                callback(error, null);
            } else {
                //devolvemos la última id insertada
                callback(null, {"insertId": result.insertId});
            }
        });
    });
};

//Update NODE from user
fwc_treeModel.updateFwc_Tree = function (nodeTreeData, callback) {

    db.get(function (error, connection) {
        if (error)
            return done('Database problem');
        var sql = 'UPDATE ' + tableModel + ' SET ' +
                'id_user = ' + connection.escape(nodeTreeData.iduser) + ',' +
                'name = ' + connection.escape(nodeTreeData.name) + ' ' +
                ' WHERE id = ' + nodeTreeData.id;

        connection.query(sql, function (error, result) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, {"msg": "success"});
            }
        });
    });
};

//FALTA BORRADO EN CASCADA
//Remove NODE with id to remove
fwc_treeModel.deleteFwc_Tree = function (iduser, id, callback) {
    db.get(function (error, connection) {
        if (error)
            return done('Database problem');
        var sqlExists = 'SELECT * FROM ' + tableModel + '  WHERE id_user = ' + connection.escape(iduser) + ' AND id = ' + connection.escape(id);
        connection.query(sqlExists, function (error, row) {
            //If exists Id from ipobj to remove
            if (row) {
                db.get(function (error, connection) {
                    var sql = 'DELETE FROM ' + tableModel + ' WHERE id_user = ' + connection.escape(iduser) + ' AND id = ' + connection.escape(id);
                    connection.query(sql, function (error, result) {
                        if (error) {
                            callback(error, null);
                        } else {
                            callback(null, {"msg": "deleted"});
                        }
                    });
                });
            } else {
                callback(null, {"msg": "notExist"});
            }
        });
    });
};

function hasLines(id, callback) {
    var ret;

    db.get(function (error, connection) {
        if (error)
            return done('Database problem');

        var sql = 'SELECT * FROM  ' + tableModel + '  where id_parent = ' + id;
        connection.query(sql, function (error, rows) {
            if (rows.length > 0) {
                ret = true;
            } else {
                ret = false;
            }
            callback(ret);
        });
    });

}

//Export the object
module.exports = fwc_treeModel;