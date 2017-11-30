var multer = require('multer');
var path = require('path');
var mysql = require('mysql');
var query = require('../helper/db_connection');
var email_service = require('../helper/email_connection');
var date = require('date-and-time');
var randomstring = require("randomstring");
var jwt = require('jwt-simple');
var md5 = require('md5');
var config = require('../config/config.json');

var user_service = {
    validate: function(req, result) {
      let current_time = new Date();
      //date.format(current_time, 'YYYY-MM-DD HH:mm:ss');
      let params = [req.body.username, req.body.password, 'active'];
      let query_cmd = 'SELECT * FROM apbi_user WHERE user_id = ? and password = md5(?) and user_status = ?';
      let users = new Object();
      let params_update = [current_time, req.body.username];
      let query_update = 'UPDATE apbi_user set last_login = ? where user_id = ?';
      query(mysql.format(query_cmd, params))
      .then(function (r) {
          users.id = r[0].user_id;
          users.role = r[0].role;
          users.address = r[0].address;
          users.email = r[0].email;
          users.delivery_addr = r[0].delivery_addr;          
          if(users.id != ""){
            query(mysql.format(query_update, params_update));
            result(users);
          }else{
            console.log("login failed");
            result(null);
          }
      })
      .catch(function(e){
          console.log("error: "+e);
          result(null);
      });
    },
    apply_password: function(req, res){
      let param_values = req.body;
      let param_query = req.query;
      let query_cmd_update = "UPDATE apbi_user set password = ?, new_password = '', link = '' where user_id = ?;";
      let params_select = [param_query.link];
      let query_cmd_select = "SELECT user_id, new_password FROM apbi_user where link = ? limit 1;";
      query(mysql.format(query_cmd_select, params_select))
      .then(function(result){
        if(typeof result[0] != 'undefined'){
          let params_update = [result[0].new_password, result[0].user_id];
          query(mysql.format(query_cmd_update, params_update))
          .then(function(r){
            res.json({
              "status": 200,
              "message": "Your password have been reset"
            });
          })
          .catch(function(error){console.log("error: "+ error);});
        }else{
          res.json({
            "status": 200,
            "message": "No token found"
          });
        }
      })
      .catch(function(error){console.log("error: "+ error);});
    },
    forget : function(req, res) {
      let random_string = randomstring.generate(75);
      let random_password = randomstring.generate(8);
      let random_password_md5 = md5(random_password);
      let server_host = config.host_url;
      let current_time = new Date();
      current_time = date.format(current_time, 'YYYY-MM-DD HH:mm:ss');

      let params_select = [req.body.username];
      let query_cmd_select = "SELECT email from apbi_user where user_id = ? limit 1;";
      let params_update = [random_password_md5, random_string, req.body.username];
      let query_cmd_update = "UPDATE apbi_user set new_password = ? ,link = ? where user_id = ?;";
      query(mysql.format(query_cmd_select, params_select))
      .then(function(result){
        if(typeof result[0] != 'undefined'){
          query(mysql.format(query_cmd_update, params_update))
          .then(function(r){
            let mailOptions = {
              to: result[0].email,
              subject: 'APBI: Request for Resetting the password '+ current_time,
              html: '<p>Hi,</p>' +
              '<p>This email is sent from APBI system because you want to reset your password.</p>' +
              '<p>If you dont want to do this, just ignore this email.</p>' +
              '<p>If you want to reset your password click link below.</p>' +
              '<p><a href="'+server_host+'/forget_action?link='+ random_string +'">Reset my password</a></p>' +
              '<p>After clicking the link your password will be: ' + random_password +'</p>' +
              '<br><br><p>Thanks,</p>' +
              '<p>APBI System</p>'
            };
            //send email to user
            email_service.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log("error: "+error);
                res.json({
                  "status": 500,
                  "message": "Internal Server Error"
                });
              } else {
                res.json({
                  "status": 200,
                  "message": "New password and activation link have been sent to your email"
                });
              }
            });
          })
          .catch(function(error){console.log("error: "+ error);});
        }else{
          console.log("not found");
          res.json({
            "status": 200,
            "message": "No user found"
          });
        }
      })
      .catch(function(error){console.log("error: "+ error);})
    },
    register: function(req, res){
      let current_time = new Date();
      let params = new Array();
      let param_values = req.body;
      date.format(current_time, 'YYYY-MM-DD HH:mm:ss');
      params_insert = [param_values.user_id,param_values.name,param_values.address,param_values.email,param_values.password,current_time];
      params_check = [param_values.user_id];
      var query_cmd_insert = "INSERT INTO apbi_user VALUES (?,?,?,?,md5(?),'non_member','','''','','',?,'active','','','');";
      var query_cmd_check = "SELECT COUNT(user_id) as isExist FROM apbi_user where user_id = ?;";
      query(mysql.format(query_cmd_check, params_check))
      .then(function(result){
        if(result[0].isExist == 0){
          query(mysql.format(query_cmd_insert, params_insert))
          .then(function(r){
            var mailOptions = {
              to: param_values.email,
              subject: 'Welcome to APBI '+ param_values.name,
              text: 'Your Account has been created as non-member, become a member to get special price!'
            };
            //send email to user
            email_service.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
            res.json({
              "status": 200,
              "message": "Successfully Registered"
            });
          })
          .catch(function(e){
            console.log("error: "+e);
            res.json({
              "status": 500,
              "message": "Internal Server Error"
            });
          });
        }else{
          res.json({
            "status": 400,
            "message": "userID is already used, use the another one"
          });
        }
      });
      
    },
    update_profile: function(req, res){
      try{
        let prof_pic = '';
        let decoded = jwt.decode(req.headers["x-token"], config.jwt_signature);
        var storage = multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, './static/profile_images');
        },
        filename: function(req, file, callback){
          if(decoded.user == req.body.user_id){
            prof_pic = req.body.user_id+path.extname(file.originalname);
            callback(null, prof_pic);
          }else{
            callback(null, null);
          }
        }
        });
        var upload = multer({storage: storage}).array('prof_pic', 1); //max can upload 1 photo
        upload(req, res, function(err){
        if(err){
          console.log("error: "+err);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Upload Failed"
          });
        }
        else{
          let params=req.body;
          if(decoded.user == params.user_id){
            let params_update = [prof_pic, params.name, params.address, params.email, params.password, params.deliv_addr, params.account_no, params.bank_name, decoded.user];
            let query_update = 'UPDATE apbi_user set prof_pic=?, name=?, address=?, email=?, password=md5(?), delivery_addr=?, account_no=?, bank_name=? ' +
            'WHERE user_id = ?';
            query(mysql.format(query_update, params_update))
            .then(function(result){
              res.status(config.http_code.ok);
              res.json({
                "status": config.http_code.ok,
                "message": "Successfully Updated"
              });
            })
            .catch(function(error){
              console.log("error: "+error);
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
                "message": "Unauthorized"
            });
          }
        }});
      }catch(error){
        console.log("error: "+error);
        res.status(config.http_code.in_server_err);
        res.json({
          "status": config.http_code.in_server_err,
          "message": "Internal Server Error"
        });
      }  
    },
    set_member_status: function(req, res){
      let params=req.body;
      let params_update = [params.approve_as, params.username];
      let query_update = 'UPDATE apbi_user set role = ? where user_id = ?'
      if(params.approve_as != 'member' && params.approve_as != 'non_member'){
        res.status(config.http_code.bad_req);
        res.json({
            "status": config.http_code.bad_req,
            "message": "Bad Request"
        });
        return;
      }
      query(mysql.format(query_update, params_update))
      .then(function(result){
        if(result.affectedRows>0){
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "Successfully Updated"
          });
        }else{
          res.status(config.http_code.ok);
          res.json({
            "status": config.http_code.ok,
            "message": "No user was updated"
          });
        }
      })
      .catch(function(error){
        console.log("error: "+error);
        res.status(config.http_code.in_server_err);
        res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
        });
      });
    },
    display_profile: function(req, res){
      let params=req.body;
      let decoded = jwt.decode(params.token, config.jwt_signature);
      if(params.user_id == decoded.user){
        let params_select = [params.user_id];
        let query_cmd = "SELECT user_id, name, email, address, role, delivery_addr, account_no, bank_name, user_status, prof_pic FROM apbi_user where user_id = ?";
        query(mysql.format(query_cmd, params_select))
        .then(function(result){
          let profile = new Object();
          for(let i=0; i<result.length; i++){
            profile.name = result[i].name;
            profile.email = result[i].email;
            profile.address = result[i].address;
            profile.role =  result[i].role;
            profile.delivery_addr =  result[i].delivery_addr;
            profile.account_no =  result[i].account_no;
            profile.bank_name =  result[i].bank_name;
            profile.user_status =  result[i].user_status;
            profile.picture = "/api/images/user/"+result[i].prof_pic;
          }
          res.status(config.http_code.ok);
          res.json(profile);
        })
        .catch(function(error){
          console.log("error: "+error);
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
          "message": "Unauthorized"
        });
      }
    }
};
module.exports = user_service;