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
    let data = req.body;
    let current_time = new Date();
    let user_name = jwt.decode(data.token, config.jwt_signature).user;
    waterfall([
      function check_authorization(isAuth){
        let select_param = [data.id];
        let query_cmd_select = "SELECT posted_by from forum WHERE forum_id = ? limit 1";
        query(mysql.format(query_cmd_select, select_param)).then(function(res){
          if(res[0].posted_by == user_name) isAuth(null, true);
          else isAuth(null, false);
        })
      },
      function updateThread(isAuth){
        if(isAuth){
          let query_cmd_update = "UPDATE forum SET title = ?, last_update_date = ?, last_update_by = ?, status = ? WHERE forum_id = ?";
          let params_update =[data.title, current_time, user_name, data.status, data.id];
          query(mysql.format(query_cmd_update, params_update)).then(function(result){
            if(result.affectedRows > 0){
              res.status(config.http_code.ok);
              res.json({
                "status": config.http_code.ok,
                "message": "Successfully Updated"
              });
            }else{
              res.status(config.http_code.ok);
              res.json({
                "status": config.http_code.ok,
                "message": "Nothing updated"
              });
            }
          }).catch(function(error){
            res.status(config.http_code.in_server_err);
            res.json({
              "status": config.http_code.in_server_err,
              "message": "Internal Server Error"
            });
          });
        }else{
          res.status(config.http_code.unauthorized);
          res.json({
            "status": config.http_code.unauthorized,
            "message": "Not authorized"
          });
        }
      }
    ]);
  },
  add_comment: function(req, res){
    res.json("add comment");
  },
  delete_comment: function(req, res){
    res.json("delete comment");
  },
  view_thread: function(req, res){
    let body = req.body;
    let query = req.query;
    let current_time = new Date();
    let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
    waterfall([
      function getAllThread(threads){
        let query_cmd_select = "SELECT forum_id, title, content, posted_date, posted_by, last_update_by, last_update_date "+
        "FROM forum "+
        "WHERE DATE(posted_date) BETWEEN ? AND ? AND posted_by LIKE ?";
        let posted_by = ((query.posted_by == "") ? "%" : query.posted_by);
        let params_select =[query.posted_date_from, query.posted_date_to, posted_by];
        query(mysql.format(query_cmd_select, params_select)).then(function(data){

        }).catch(function(error){
          
        });
    }]);
    
    res.json("view thread");
  }
};
 
module.exports = forum_service;