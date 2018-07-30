var jwt = require('jwt-simple');
var mysql = require('mysql');
var moment = require('moment');
var user_service = require('./user_service.js');
var config = require('../config/config.json');
var query = require('../helper/db_connection');

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
                    //here
                    let current_time = new Date();
                    let return_val = genToken(dbUserObj);
                    let params_update = [return_val.token, current_time, req.body.token];
                    let query_cmd_update = "UPDATE user_token SET token = ?, last_update = ? WHERE token = ? "
                    query(mysql.format(query_cmd_update, params_update)).then(function(result){
                        if(result.affectedRows > 0){
                            res.status(config.http_code.ok);
                            res.json(return_val);
                            return;
                        }else{
                            res.status(config.http_code.unauthorized);
                            res.json({
                                "status": config.http_code.unauthorized,
                                "message": "Token Expired"
                            });
                        }
                    });
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

                let login_response = genToken(dbUserObj);
                // insert token to DB
                let current_time = new Date();
                let device_id = req.body.device_id;
                let params_delete = [dbUserObj.id, device_id];
                let query_cmd_delete = "DELETE FROM user_token WHERE user_id=? AND device_id=?"
                let params_insert = [dbUserObj.id, device_id, login_response.token, current_time];
                let query_cmd_insert = "INSERT INTO user_token (user_id, device_id, token, last_update) values (?,?,?,?)";
                query(mysql.format(query_cmd_delete, params_delete)).then(function(res_1){
                    query(mysql.format(query_cmd_insert, params_insert));
                    console.log(mysql.format(query_cmd_insert, params_insert));
                })
                //send response
                res.status(200);
                res.json(login_response);                
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
    var profile = {
        user_id: user.id,
        role: user.role,
        address: user.address,
        delivery_address : user.delivery_addr,
        email: user.email
    };
    return {
        status: 200,
        message: "Successful",
        profile: profile,
        token: token
        //expires: expires
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;