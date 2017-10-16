var mysql = require('mysql');
var query = require('../helper/db_connection');
var email_service = require('./email_service');
var date = require('date-and-time');
var randomstring = require("randomstring");
var md5 = require('md5');

var user_service = {
    validate: function(req, result) {
      let current_time = new Date();
      date.format(current_time, 'YYYY-MM-DD HH:mm:ss');
      var params = [req.body.username, req.body.password, 'active'];
      var query_cmd = 'SELECT * FROM apbi_user WHERE user_id = ? and password = md5(?) and user_status = ?';
      var test = new Object();
      var dbUserObj  = new Array();
      var params_update = [current_time, req.body.username];
      var query_update = 'UPDATE apbi_user set last_login = ? where user_id = ?';
      query(mysql.format(query_cmd, params))
      .then(function (r) {
          for(var i=0; i<r.length; i++){
            test.id = r[i].user_id;
            dbUserObj.push(test);
          }
          if(dbUserObj.length > 0){
            query(mysql.format(query_update, params_update));
            result(dbUserObj);
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
      let server_host = 'http://localhost:3000';
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
      var query_cmd_insert = "INSERT INTO apbi_user VALUES (?,?,?,?,md5(?),'viewer','','''','','',?,'active','');";
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
    test : function(req, res){
      var params = new Array();
      params[0] = '2017-09-14 20:22:00';
      params[1] = 'nunu';
      var query_cmd = 'UPDATE user SET last_login = ? WHERE user_id = ?;';
      query(mysql.format(query_cmd, params)).
      then(function(r){console.log(r)}).
      catch(function(e){console.log(e)});
      res.json("aaa");
    }
};
module.exports = user_service;