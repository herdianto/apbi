var jwt = require('jwt-simple');
var mysql = require('mysql');
var moment = require('moment');
var user_service = require('./user_service.js');
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
        user_service.validate(req, function(dbUserObj){
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
        });
    },
    validate: function(username, password) {
        // spoofing the DB response for simplicity
        var dbUserObj = { // spoofing a userobject from the DB. 
            name: 'arvinds',
            role: 'admin',
            username: 'arvind@myapp.com'
        };
        return dbUserObj;
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
        status: 200,
        message: "Successful Login",
        token: token
        //expires: expires,
        //user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;