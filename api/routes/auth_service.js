var jwt = require('jwt-simple');
var mysql = require('mysql');
var moment = require('moment');
var user_service = require('./user_service.js');
var config = require('../config/config.json');

var auth = {
    renew_token: function(req, res){
        if(req.body.token){
            let decoded;
            let dbUserObj;
            try {
                decoded = jwt.decode(req.body.token, config.jwt_signature);
                if (decoded.exp <= Date.now()) {
                    res.status(config.http_code.unauthorized);
                    res.json({
                        "status": config.http_code.unauthorized,
                        "message": "Token Expired"
                    });
                    return;
                }else{
                    dbUserObj = {
                        "id": decoded.user,
                        "role": decoded.role
                    }
                    res.status(config.http_code.ok);
                    res.json(genToken(dbUserObj));
                    return;
                }
            }
            catch(error){
                res.status(config.http_code.in_server_err);
                res.json({
                    "status": config.http_code.in_server_err,
                    "message": "Internal Server Error"
                });
                return;
            }
        }else{
            res.status(config.http_code.bad_req);
            res.json({
                "status": config.http_code.bad_req,
                "message": "Bad Request"
            });
            return;
        }
        let userObj={

        };
    },
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
                res.status(200);
                res.json(genToken(dbUserObj));
            }
        });
    }
}

// private method
function genToken(user) {
    var expires = moment().add(config.token.duration, config.token.duration_unit).valueOf(); //20 seconds
    //var expires = moment().add(12,'hours').valueOf(); //12 hours
    var payload = { user: user.id, role: user.role, exp: expires };
    //payload.exp = expires;
    var token = jwt.encode(
        payload,
        //{exp: expires},
        config.jwt_signature
    );
    return {
        status: 200,
        message: "Successful",
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