var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var contact_service = {
  update_complaint: function(req, res){
    let data = req.body;
    let current_time = new Date();
    //let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
    let query_params =[data.complaint_status, data.complaint_id];
    let query_cmd = "UPDATE contact_us SET status = ? WHERE ID = ?"
    console.log(mysql.format(query_cmd, query_params));
    query(mysql.format(query_cmd, query_params)).then(function(res_1){
      if(res_1.affectedRows > 0){
        //console.log("aa");
        res.status(config.http_code.ok);
        res.json({
          "status": config.http_code.ok,
          "message": "Successfully updated"
        });
      }else{
        //console.log("aa");
        res.status(config.http_code.ok);
        res.json({
          "status": config.http_code.ok,
          "message": "No record was updated"
        });
      }
    }).catch(function(error){
      console.log("error: "+error);
      insert(error, "error");
    });
},
  post_complaint: function(req, res){
        let data = req.body;
        let current_time = new Date();
        //let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
        let params_insert =[data.name, data.email, data.phone, data.content, "open"];
        let query_cmd_insert = "INSERT INTO contact_us (name, email, phone, content, status) VALUES (?,?,?,?,?)"
        console.log(mysql.format(query_cmd_insert, params_insert));
        query(mysql.format(query_cmd_insert, params_insert)).then(function(res_1){
          if(res_1.affectedRows > 0){
            //console.log("aa");
            res.status(config.http_code.ok);
            res.json({
              "status": config.http_code.ok,
              "message": "Successfully Sent"
            });
          }else{
            //console.log("aa");
            res.status(config.http_code.ok);
            res.json({
              "status": config.http_code.ok,
              "message": "No record was sent"
            });
          }
        }).catch(function(error){
          console.log("error: "+error);
          insert(error, "error");
        });
  },
  view_complaint: function(req, res){
    let page = req.params.page;
    let status = req.query.status;
    let limit = config.select_limit.images;
    let query_cmd, query_params;
    if (page < 1) page = 1;
    if(status != "all"){
      query_cmd = "SELECT * FROM contact_us WHERE status = ? limit ?,?";
      query_params = [status, (page-1)*limit, limit];
    }else{
      query_cmd = "SELECT * FROM contact_us limit ?,?";
      query_params = [(page-1)*limit, limit];
    }
    let complaints = new Array();
    //console.log(page+"aa"+limit);
    query(mysql.format(query_cmd, query_params)).then(function(data){
      for(let i=0; i<data.length; i++){
        let complaint = new Object();
        complaint.id = data[i].ID;
        complaint.name = data[i].name;
        complaint.email = data[i].email;
        complaint.phone = data[i].phone;
        complaint.status = data[i].status;
        complaint.content = data[i].content;
        complaints[i] = complaint;
      }
      res.status(config.http_code.ok);
      res.json(complaints);
    }).catch(function(err){
      console.log("error: "+ err);
      res.status(config.http_code.in_server_err);
      res.json({
        "status": config.http_code.in_server_err,
        "message": "Internal Server Error"
      });
    });
  }
};
 
module.exports = contact_service;