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
    waterfall([
      function getID(id){
        let query_cmd_select = "SELECT CONCAT('forumID_',ifnull(max(CAST(SUBSTRING(forum_id,9,30) as UNSIGNED)),0)+1) as forum_id from forum;";
        query(query_cmd_select).then(function(result_1){
          id(null, result_1[0].forum_id);
        });
      },function upload_picture(id, isUploaded){
        let pic = '';
        let decoded = jwt.decode(req.headers["x-token"], config.jwt_signature);
        var storage = multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, './static/forum_images');
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
        var upload = multer({storage: storage}).array('forum_pic', 1); //max can upload 1 photo
        upload(req, res, function(err){
          if(!err){
            isUploaded(null, id, pic);
          }else{
            isUploaded(null, id, null);
          }
        });
      },function insertforum(id, pic, insert){
        data = req.body;
        let current_time = new Date();
        let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
        let params_insert =[id, data.title, data.content, current_time, user_name, 'active', pic];
        let query_cmd_insert = "INSERT INTO forum (forum_id, title, content, posted_date, posted_by, status, picture) values (?,?,?,?,?,?,?);"
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
  },
  add_thread_old: function(req, res){
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
        let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
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
          result(error, "error");
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
          console.log(err);
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
    let role = jwt.decode(data.token, config.jwt_signature).role;
    waterfall([
      function check_authorization(isAuth){
        let select_param = [data.id];
        let query_cmd_select = "SELECT posted_by from forum WHERE forum_id = ? limit 1";
        query(mysql.format(query_cmd_select, select_param)).then(function(res){
          if(res[0].posted_by == user_name || role == 'admin') isAuth(null, true);
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
    let data = req.body;
    waterfall([
      function add_comment(result){
        let current_time = new Date();
        let user_name = jwt.decode(data.token, config.jwt_signature).user;
        let params_insert =[data.forum_id, user_name, data.content, current_time];
        let query_cmd_insert = "INSERT INTO forum_interaction (forum_id, user_id, content, posted_date) VALUES (?,?,?,?);";
         query(mysql.format(query_cmd_insert, params_insert)).then(function(res){
          if(res.affectedRows > 0){
            result(null, "success")
          }else{
            result(null, "no record");
          }
        }).catch(function(error){
          result(error, "error");
        })
      }
    ],
    function (err, result){
        if(result == "success"){
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "Successfully Inserted"
          });
        }
        else if(result == "no record"){
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "No data affected"
          });
        }
        else{
          console.log("error: "+err);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        }
      }
    );
  },
  delete_comment: function(req, res){
    let data = req.body;
    waterfall([
      function check_auth(is_auth){
        let user_name = jwt.decode(data.token, config.jwt_signature).user;
        let role = jwt.decode(data.token, config.jwt_signature).role;
        if(role == "admin"){
          is_auth(null, "true");
        }else{
          let params_select =[data.id];
          let query_cmd_select = "SELECT user_id FROM forum_interaction WHERE interaction_id = ? LIMIT 1;";
          query(mysql.format(query_cmd_select, params_select)).then(function(res){
            if(res.length == 1 && res[0].user_id == user_name){
              is_auth(null, "true");
            }else{
              is_auth(null, "false");
            };
          })
        }
      },
      function delete_comment(is_auth, result){
        if(is_auth == "true"){
          let current_time = new Date();
          let params_delete =[data.id];
          let query_cmd_delete = "DELETE FROM forum_interaction WHERE interaction_id = ?"
          query(mysql.format(query_cmd_delete, params_delete)).then(function(res){
            if(res.affectedRows > 0){
              result(null, "success");
            }else{
              result(null, "no record");
            }
          }).catch(function(error){
            console.log("error: "+error);
            result(null, "error");
          });
        }else{
          result(null, "no_auth");
        }
      }
    ],
    function (err, result){
        if(result == "success"){
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "Successfully Deleted"
          });
        }
        else if(result == "no record"){
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "No data affected"
          });
        }
        else if(result == "no_auth"){
          res.status(config.http_code.unauthorized);
          res.json({
            "status": config.http_code.unauthorized,
            "message": "Unauthorized"
          });
        }
        else{
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        }
      }
    );
  },
  view_thread: function(req, res){
    let body = req.body;
    let qry = req.query;
    let current_time = new Date();
    let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
    let limit = config.select_limit.thread;
    waterfall([
      function getAllThread(threads){
        let query_cmd_select = "SELECT t1.*, t2.content as a, t2.user_id as b, t2.posted_date as c, t2.interaction_id as d FROM (SELECT forum_id, title, content, posted_date, posted_by, last_update_by, last_update_date "+
        "FROM forum "+
        "WHERE DATE(posted_date) BETWEEN ? AND ? AND posted_by LIKE ? AND status='active' ORDER BY posted_date DESC limit ?,?) t1 LEFT JOIN forum_interaction t2 ON t2.forum_id = t1.forum_id";
        let page = qry.page;
        if (page < 1) page = 1; 
        let posted_by = ((qry.posted_by == "") ? "%" : qry.posted_by);
        let params_select =[qry.posted_date_from, qry.posted_date_to, posted_by, (page-1)*limit, limit];
        let forums = [];
        let forum_ids = [];
        let forum_id= [];
        console.log(mysql.format(query_cmd_select, params_select));
        query(mysql.format(query_cmd_select, params_select)).then(function(data){
          for(let i=0; i<data.length; i++){
            forum_ids[i] = data[i].forum_id;
          }
          forum_id =  forum_ids.filter((x, i, a) => a.indexOf(x) == i);

          for(let i=0; i<forum_id.length; i++){
            let counter = 0;
            let comments = [];
            let forum = {};
            for(let j=0; j<data.length; j++){
              if(data[j].forum_id == forum_id[i]){
                let comment = {};
                forum.id = data[j].forum_id;
                forum.title = data[j].title;
                forum.content = data[j].content;
                forum.posted_date = data[j].posted_date;
                forum.posted_by = data[j].posted_by;
                forum.last_update_by = data[j].last_update_by;
                forum.last_update_date = data[j].last_update_date;
                comment.id = data[j].d;
                comment.content = data[j].a;
                comment.user_id = data[j].b;
                comment.posted_date = data[j].c;
                if(comment.id != null)
                comments[counter] = comment;
                counter++;
              }
            }
            forum.comment = comments;
            forums[i]=forum;
          }
          res.status(config.http_code.ok);
          res.json(forums);
        }).catch(function(error){
          console.log("error: "+error);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        });
    }]);
  },
  get_comment: function(req, res){
    let body = req.body;
    let qry = req.query;
    let current_time = new Date();
    let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
    waterfall([
      function getAllThread(threads){
        let query_cmd_select = "SELECT interaction_id, user_id, content, posted_date, content FROM forum_interaction WHERE forum_id=? ORDER BY interaction_id DESC Limit ?,?";
        let thread_id = qry.thread_id;
        let page = qry.page;
        let limit = config.select_limit.comment;
        let params_select =[thread_id, (page-1)*limit, limit];
        let comments = new Array();
        query(mysql.format(query_cmd_select, params_select)).then(function(data){
            for(let j=0; j<data.length; j++){
                let comment = new Object();  
                comment.id = data[j].interaction_id;
                comment.posted_by = data[j].user_id;
                comment.posted_data = data[j].posted_date;
                comment.content = data[j].content;
                comments[j]=comment;
            }
          res.status(config.http_code.ok);
          res.json(comments);
        }).catch(function(error){
          console.log("error: "+error);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        });
    }]);
  }
};
 
module.exports = forum_service;