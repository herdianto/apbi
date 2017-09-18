var jwt = require('jwt-simple');
var mysql = require('mysql');
var moment = require('moment');
var query = require('../helper/db_helper');
var auth = {
    login: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';
        if (username == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }
        // Fire a query to your DB and check if the credentials are valid
        var dbUserObj = auth.validate(req.body);
        //console.log(dbUserObj);
        if (!dbUserObj) { // If authentication fails, we send a 401 back
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }
        if (dbUserObj) {
            // If authentication is success, we will generate a token
            // and dispatch it to the client
            res.json(genToken(dbUserObj));
        }
    },
    validate: function(params) {
        var rtn = new Object();
        var param = new Array();
        param[0] = params.username;
        param[1] = params.password;
        var query_cmd = 'SELECT * FROM user where user_id = ? and password = md5(?);';
        return query(mysql.format(query_cmd, param))
        .then(function (r) {
            rtn = r;
            //return rtn;
        })
        .catch(function(e){
            rtn = null;
            //return rtn;
        });
        // var dbUserObj = { // spoofing a userobject from the DB. 
        //     name: 'arvind',
        //     role: 'admin',
        //     username: 'arvind@myapp.com'
        // };

        // return dbUserObj;
        //console.log(mysql.format(query_cmd, param));
        //console.log(rtn);      
    },
    validateUser: function(username) {
        // spoofing the DB response for simplicity
        var dbUserObj = { // spoofing a userobject from the DB. 
            name: 'arvind',
            role: 'admin',
            username: 'arvind@myapp.com'
        };
        return dbUserObj;
    },
}

// private method
function genToken(user) {
    var expires = moment().add(20,'seconds').valueOf(); //20 seconds
    //var expires = moment().add(12,'hours').valueOf(); //12 hours
    var payload = { user: user.name, exp: expires };
    //payload.exp = expires;
    var token = jwt.encode(
        payload,
        //{exp: expires},
        require('../config/secret')()
    );
    return {
        token: token,
        expires: expires,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;