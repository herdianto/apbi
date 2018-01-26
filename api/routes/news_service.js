var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var news_service = {
  post_news: function(req, res){
    let data = req.body;
    waterfall([
      function getID(id){
        let query_cmd_select = "SELECT CONCAT('newsID_',ifnull(max(CAST(SUBSTRING(news_id,8,30) as UNSIGNED)),0)+1) as news_id from news";
        query(query_cmd_select).then(function(result_1){
          id(null, result_1[0].news_id);
        });
      },
      function insertNews(id, result){
        let current_time = new Date();
        let user_name = jwt.decode(data.token, config.jwt_signature).user;
        let params_insert =[id, data.title, data.content, current_time, user_name, 'active'];
        let query_cmd_insert = "INSERT INTO news (news_id, title, content, posted_date, posted_by, status) values (?,?,?,?,?,?);"
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
  edit_news: function(req, res){
    let data = req.body;
    let current_time = new Date();
    let user_name = jwt.decode(data.token, config.jwt_signature).user;
    waterfall([
      function check_authorization(isAuth){
        isAuth(null, true);
      },
      function updateNews(isAuth){
        if(isAuth){
          let query_cmd_update = "UPDATE news SET title = ?, content = ?, last_update_date = ?, last_update_by = ?, status = ? WHERE news_id = ?";
          let params_update =[data.title, data.content, current_time, user_name, data.status, data.id];
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
  get_news: function(req, res){
    let body = req.body;
    let qry = req.query;
    let current_time = new Date();
    waterfall([
      function getNews(threads){
        let query_cmd_select = "SELECT news_id, title, content, posted_date, posted_by, last_update_date, last_update_by "+
         "FROM news WHERE status = 'active'";
        let params_select =[];
        let news = new Array();
        query(mysql.format(query_cmd_select, params_select)).then(function(data){
          res.status(config.http_code.ok);
          for(let i=0; i<data.length; i++){
            let about = {};
            about.id = data[i].about_id;
            about.title = data[i].title;
            about.content = data[i].content;
            about.posted_date = data[i].posted_date;
            about.posted_by = data[i].posted_by;
            about.last_update_by = data[i].last_update_by;
            about.last_update_date = data[i].last_update_date;
            news[i] = about;
          }
          res.json(news);
        }).catch(function(error){
          console.log("error: "+ error);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        });
    }]);
  },
  get_news_admin: function(req, res){
    //to be implemented if needed
  },
  search_news: function(req, res){
    let news_s = new Array();
    let news = new Object();
    waterfall([
      function getNews(callback){
        let params_select =['%'+req.query.keyword+'%', '%'+req.query.keyword+'%'];
        let query_cmd_select = "SELECT * FROM news WHERE (title LIKE ? OR content LIKE ?) AND status ='active';"
        query(mysql.format(query_cmd_select, params_select)).
          then(function(result){
            for(let i=0; i<result.length; i++){
              news = {
                news_id: result[i].news_id,
                title: result[i].title,
                content: result[i].content,
                posted_date: result[i].posted_date,
                posted_by: result[i].posted_by,
                last_update_date: result[i].last_update_date,
                last_update_by: result[i].last_update_by,
                status:result[i].status 
              };
              news_s[i]=news;
            }
            callback(null, news_s);
          })
          .catch(function(error){
            console.log("error: "+ error);
            res.status(config.http_code.in_server_err);
            res.json({
              "status": config.http_code.in_server_err,
              "message": "Internal Server Error"
            });
          });
      }
    ], 
      function (err, news_s){
        res.status(config.http_code.ok);
        res.json(news_s);
      }
    );
  }
};
 
module.exports = news_service;