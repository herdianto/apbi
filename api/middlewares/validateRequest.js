var jwt = require('jwt-simple');
var validateUser = require('../routes/auth_service').validateUser;
var config = require('../config/config.json');
 
module.exports = function(req, res, next) {
 
  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 
 
  // We skip the token outh for [OPTIONS] requests.
  //if(req.method == 'OPTIONS') next();
 
  var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-token'];
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
 
  if (token || key) {
    try {
      var decoded = jwt.decode(token, config.jwt_signature);
 
      if (decoded.exp <= Date.now()) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }
 
      // Authorize the user to see if s/he can access our resources
 
      //var dbUser = validateUser(key); // The key would be the logged in user's username
      var dbUser = decoded;
      if (dbUser.user) {
        if (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/') >= 0) {
            next(); // To move to next middleware
        } else if((req.url.indexOf('admin') >= 0) && (req.url.indexOf('/api/') >= 0) && (dbUser.role == 'admin')){
            next();
        } else {
          res.status(config.http_code.unauthorized);
          res.json({
            "status": config.http_code.unauthorized,
            "message": "Not Authorized"
          });
          return;
        }
      } else {
        // No user with this name exists, respond back with a 401
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid User"
        });
        return;
      }
 
    } catch (error) {
      console.log(error);
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": error
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};