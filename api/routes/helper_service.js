var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var helper_services = {
  add_thread: function(req, res){
    waterfall([
      function upload_picture(id, isUploaded){
        let pic = '';
        let decoded = jwt.decode(req.headers["x-token"], config.jwt_signature);
        var storage = multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, './static/public_images');
        },
        filename: function(req, file, callback){
          //if(decoded.user == req.body.user_id){
            pic = id+path.extname(file.originalname);
            callback(null, pic);
          //}else{
          //  callback(null, null);
          //}
        }
        });
        var upload = multer({storage: storage}).array('images', 1); //max can upload 1 photo
        upload(req, res, function(err){
          if(!err){
            isUploaded(null, id, pic);
          }else{
            isUploaded(null, id, null);
          }
        });
      },function insertforum(id, pic, insert){
        let data = req.body;
        let current_time = new Date();
        let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
        let params_insert =[id, data.title, data.content, current_time, user_name, 'active', pic];
        let query_cmd_insert = "INSERT INTO forum (forum_id, title, content, posted_date, posted_by, status, picture) values (?,?,?,?,?,?,?);"
        insert(null, "success");
        /*
        query(mysql.format(query_cmd_insert, params_insert)).then(function(res_1){
          if(res_1.affectedRows > 0){
            //console.log("aa");
            insert(null, "success");
          }else{
            //console.log("bb");
            insert(null, "no record");
          }
        }).catch(function(error){
          console.log("error: "+error);
          insert(error, "error");
        });
        */
      }
      ],function (error, result){
        if(result == "success"){
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "Successfully Inserted"
          });
        }else{
          console.log("error: "+error);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        }
      }
    );
  }
};
 
module.exports = helper_service;