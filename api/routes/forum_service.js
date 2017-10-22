var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var forum_service = {
  add_thread: function(req, res){
    let data = req.body;
    waterfall([
      function getID(id){
        let query_cmd_select = "SELECT CONCAT('forumID_',ifnull(max(CAST(SUBSTRING(forum_id,9,30) as UNSIGNED)),0)+1) as forum_id from forum;";
        query(query_cmd_select).then(function(result_1){
          id(null, result_1[0].forum_id);
        });
      },
      function insertforum(id, result){
        let current_time = new Date();
        let user_name = jwt.decode(data.token, config.jwt_signature).user;
        let params_insert =[id, data.title, data.content, current_time, user_name, 'active'];
        let query_cmd_insert = "INSERT INTO forum (forum_id, title, content, posted_date, posted_by, status) values (?,?,?,?,?,?);"
        query(mysql.format(query_cmd_insert, params_insert)).then(function(res){
          if(res.affectedRows > 0){
            result(null, "success");
          }else{
            result(null, "no record");
          }
        }).catch(function(error){
          console.log("error: "+error);
          result(null, "error");
        });
      }
    ],
    function (err, result){
        if(result == "success"){
          res.status(config.http_code.ok);
          res.json({
                  "status": config.http_code.ok,
                  "message": "Successfully Inserted"
                });
        }else{
          res.status(config.http_code.in_server_err);
          res.json({
                  "status": config.http_code.in_server_err,
                  "message": "Internal Server Error"
                });
        }
      }
    );
  },
  update_thread: function(req, res){
    res.json("update thread");
  },
  add_comment: function(req, res){
    res.json("add comment");
  },
  delete_comment: function(req, res){
    res.json("delete comment");
  },
  view_thread: function(req, res){
    res.json("view thread");
  }
};
 
module.exports = forum_service;