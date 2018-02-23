var express = require('express');
var router = express.Router();
var UserModel = require('../../models/user/user');
var api_resp = require('../../utils/api_response');
var objModel = 'USER';

var parseFile = require('./parse_file.js');

var SseChannel = require('sse-channel');
var redis = require('redis');
var publisherClient = redis.createClient();


var logger = require('log4js').getLogger("app");

var cp = require("child_process");

//BLOQUEAR ACCESOS. SOLO ACCESO PARA ADMINISTRACION

        
        

router.get('/update-stream', function(req, res) {
  // let request last as long as possible
  req.socket.setTimeout(99999999);

  var messageCount = 0;
  var subscriber = redis.createClient();

  subscriber.subscribe("updates");

  // In case we encounter an error...print it out to the console
  subscriber.on("error", function(err) {
    logger.debug("Redis Error: " + err);
  });

  // When we receive a message from the redis connection
  subscriber.on("message", function(channel, message) {
    messageCount++; // Increment our message count
    
    logger.debug("RECIBIENDO NUEVO MENSAJE: " + messageCount + "  MSG: " + message);
    res.write('id: ' + messageCount + '\n');
    res.write("data: " + message + '\n\n'); // Note the extra newline
  });

  //send headers for event-stream connection
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  // The 'close' event is fired when a user closes their browser window.
  // In that situation we want to make sure our redis channel subscription
  // is properly shut down to prevent memory leaks...and incorrect subscriber
  // counts to the channel.
  req.on("close", function() {
    subscriber.unsubscribe();
    subscriber.quit();
  });
});

router.get('/fire-event/:event_name', function(req, res) {
  publisherClient.publish( 'updates', ('"' + req.params.event_name + '" page visited') );
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('All clients have received "' + req.params.event_name + '"');
  res.end();
});

router.get('/msg', function(req, res){
    res.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-control": "no-cache" });

    var spw = cp.spawn('ping', ['-c', '100', '127.0.0.1']),
    str = "";

    
    
    spw.stdout.on('data', function (data) {
        str += data.toString();

        // just so we can see the server is doing something
        console.log("data");

        
        
        // Flush out line by line.
        var lines = str.split("\n");
        for(var i in lines) {
            if(i == lines.length - 1) {
                str = lines[i];
            } else{
                // Note: The double-newline is *required*
                res.write('data: ' + lines[i] + "\n\n");
            }
        }
    });
    
    spw.on('close', function (code) {
        res.end(str);
    });

    spw.stderr.on('data', function (data) {
        res.end('stderr: ' + data);
    });
});


/* Get Stream*/
router.get('/stream-log/:isuser/', function (req, res)
{
    parseFile(__dirname+'/../../logs/app_fwcloud.log').pipe(res);


});

/* Get Stream*/
router.get('/stream-log1/:isuser/', function (req, res)
{
    const {Readable} = require('stream');


    const inStream = new Readable({
        read(size) {
            this.push(String.fromCharCode(this.currentCharCode++));
            if (this.currentCharCode > 90) {
                this.push(null);
            }
        }
    });

    inStream.currentCharCode = 65;

    inStream.pipe(res);


});

/* Get all users by customer*/
router.get('/:customer', function (req, res)
{
    var customer = req.params.customer;
    UserModel.getUsers(customer, function (error, data)
    {
        //show user form
        if (data && data.length > 0)
        {
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
    var customer = req.params.customer;
    var username = req.params.username;
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
        if (error)
            api_resp.getJson(data, api_resp.ACR_ERROR, 'SQL ERRROR', '', error, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        else {
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
        if (error)
            api_resp.getJson(data, api_resp.ACR_ERROR, 'SQL ERRROR', '', error, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        else {
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
        }
    });
});

/* Get User by id */
router.get('/:customer/user/:id', function (req, res)
{
    var customer = req.params.customer;
    var id = req.params.id;
    //
    if (!isNaN(id))
    {
        UserModel.getUser(customer, id, function (error, data)
        {
            //If exists show de form
            if (data && data.length > 0)
            {
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
        api_resp.getJson(null, api_resp.ACR_DATA_ERROR, '', objModel, null, function (jsonResp) {
            res.status(200).json(jsonResp);
        });
    }
});




/* remove the user */
router.put("/del/user/", function (req, res)
{
    //User id
    var id = req.param('id');
    UserModel.deleteUser(id, function (error, data)
    {
        if (error)
            api_resp.getJson(data, api_resp.ACR_ERROR, 'SQL ERRROR', '', error, function (jsonResp) {
                res.status(200).json(jsonResp);
            });
        else {
            if (data && data.result)
            {
                //res.redirect("/users/");
                api_resp.getJson(null, api_resp.ACR_UPDATED_OK, 'DELETED OK', objModel, null, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            } else
            {
                api_resp.getJson(data, api_resp.ACR_ERROR, 'Error', objModel, error, function (jsonResp) {
                    res.status(200).json(jsonResp);
                });
            }
        }
    });
});

module.exports = router;