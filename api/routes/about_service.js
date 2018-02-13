var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var about_service = {
  post_about: function(req, res){
    waterfall([
      function getID(id){
        let query_cmd_select = "SELECT CONCAT('aboutID_',ifnull(max(CAST(SUBSTRING(about_id,9,30) as UNSIGNED)),0)+1) as about_id from about;";
        query(query_cmd_select).then(function(result_1){
          id(null, result_1[0].about_id);
        });
      },
      function upload_picture(id, isUploaded){
        let pic = '';
        //let decoded = jwt.decode(req.headers["x-token"], config.jwt_signature);
        var storage = multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, './static/about_images');
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
        var upload = multer({storage: storage}).array('about_pic', 1); //max can upload 1 photo
        upload(req, res, function(err){
          if(!err){
            isUploaded(null, id, pic);
          }else{
            isUploaded(null, id, null);
          }
        });
      },
      function insertforum(id, pic, result){
        let current_time = new Date();
        let data = req.body;
        let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
        let params_insert =[id, data.title, data.content, current_time, user_name, 'active', pic];
        let query_cmd_insert = "INSERT INTO about (about_id, title, content, posted_date, posted_by, status, picture) values (?,?,?,?,?,?,?);"
        console.log(mysql.format(query_cmd_insert, params_insert));
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
  edit_about: function(req, res){
    let data = req.body;
    let current_time = new Date();
    let user_name = jwt.decode(data.token, config.jwt_signature).user;
    waterfall([
      function check_authorization(isAuth){
        isAuth(null, true);
      },
      function updateAbout(isAuth){
        if(isAuth){
          let query_cmd_update = "UPDATE about SET title = ?, content = ?, last_update_date = ?, last_update_by = ?, status = ? WHERE about_id = ?";
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
  get_about: function(req, res){
    let body = req.body;
    let qry = req.query;
    let current_time = new Date();
    waterfall([
      function getAbout(threads){
        let query_cmd_select = "SELECT about_id, title, content, posted_date, posted_by, last_update_date, last_update_by, picture, apbi_user.prof_pic "+
         "FROM about, apbi_user WHERE status = 'active' AND about.posted_by = apbi_user.user_id order by posted_date DESC LIMIT 1";
        let params_select =[];
        let about = {};
        query(mysql.format(query_cmd_select, params_select)).then(function(data){
          res.status(config.http_code.ok);
          for(let i=0; i<data.length; i++){
            about.id = data[i].about_id;
            about.title = data[i].title;
            about.content = data[i].content;
            about.posted_date = data[i].posted_date;
            about.posted_by = data[i].posted_by;
            about.user_picture = data[i].prof_pic;
            about.last_update_by = data[i].last_update_by;
            about.last_update_date = data[i].last_update_date;
            about.picture = data[i].picture;
            if(about.picture != "" && about.picture != null){
              about.picture = "/about_images/"+data[i].picture;
            }else{
              about.picture = null;
            }
            if(about.user_picture != "" && about.user_picture != null){
              about.user_picture = "/api/images/user"+data[i].user_picture;
            }else{
              about.user_picture = null;
            }
          }
          res.json(about);
        }).catch(function(error){
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        });
    }]);
  },
  get_about_admin: function(req, res){
    //to be implemented if needed
  }
};
 
module.exports = about_service;