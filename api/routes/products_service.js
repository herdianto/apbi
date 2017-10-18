var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');

var product_service = {
  create: function(req, res) {
    let query_cmd_prd_id = "SELECT CONCAT('prd_',max(CAST(SUBSTRING(product_id,5,30) as UNSIGNED))+1) as prd_id from product;"
    query(query_cmd_prd_id)
    .then(function(result){
      var file_number = 1;
      var storage = multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, './images');
        },
        filename: function(req, file, callback){
          callback(null, result[0].prd_id + "_" + file_number+path.extname(file.originalname));
          file_number = file_number + 1;
        }
      });
      var upload = multer({storage: storage}).array('photos', 3); //max can upload 3 photos
      upload(req, res, function(err){
        if(err){
          return res.json(err);  
        }
        else{
          let params = req.body;
          let headers = req.headers;
          let token = headers['x-token']
          let decoded = jwt.decode(token, config.jwt_signature);
          let current_time = new Date();
          let params_insert = [result[0].prd_id, params.name, params.description, params.member_price, params.non_member_price, current_time, decoded.user];
          let query_cmd_insert = "INSERT INTO product (product_id, name, description, member_price, non_member_price, posted_date, posted_by) values (?,?,?,?,?,?,?);";
            query(mysql.format(query_cmd_insert, params_insert))
            .then(function(result_insert){
              if(result_insert.affectedRows > 0){
                console.log(req.files.length);
                for(let i=0; i<req.files.length; i++){
                  let params_insert = [result[0].prd_id, req.files[i].filename];
                  let query_cmd_insert = "INSERT INTO attachment_url (product_id, url) values (?,?);";
                  query(mysql.format(query_cmd_insert, params_insert));
                  console.log(mysql.format(query_cmd_insert, params_insert));
                }
                res.status(config.http_code.ok);
                res.json({
                  "status": config.http_code.ok,
                  "message": "Successfully Inserted"
                });
              }else{
                res.status(config.http_code.ok);
                res.json({
                  "status": config.http_code.ok,
                  "message": "Insert Failed"
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
        }
      });
    });
  },
  search: function(req, res){
    let obats = new Array();
    let obat = new Object();
    let params_select =['%'+req.query.keyword+'%', '%'+req.query.keyword+'%'];
    let query_cmd_select = "SELECT * FROM product WHERE name LIKE ? OR description LIKE ? and status ='active';"
    query(mysql.format(query_cmd_select, params_select)).
    then(function(result){
      for(let i=0; i<result.length; i++){
        obat = {
          product_id: result[i].product_id,
          name: result[i].name,
          description: result[i].description,
          member_price: result[i].member_price,
          non_member_price: result[i].non_member_price,
          posted_date: result[i].posted_date,
          posted_by: result[i].posted_by,
          last_update_date: result[i].last_update_date,
          last_update_by: result[i].last_update_by
        };
        obats[i]=obat;
      }
      res.status(config.http_code.ok);
      res.json(obats);
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
  search_admin: function(req, res){
    let obats = new Array();
    let obat = new Object();
    let params_select =['%'+req.body.keyword+'%', '%'+req.body.keyword+'%', req.body.status];
    if(req.body.status != "all"){
      query_cmd_select = "SELECT * FROM product WHERE (name LIKE ? OR description LIKE ?) AND status = ?;";
    }else{
      query_cmd_select = "SELECT * FROM product WHERE name LIKE ? OR description LIKE ?";
    }
    query(mysql.format(query_cmd_select, params_select)).
    then(function(result){
      for(let i=0; i<result.length; i++){
        obat = {
          product_id: result[i].product_id,
          name: result[i].name,
          description: result[i].description,
          member_price: result[i].member_price,
          non_member_price: result[i].non_member_price,
          posted_date: result[i].posted_date,
          posted_by: result[i].posted_by,
          last_update_date: result[i].last_update_date,
          last_update_by: result[i].last_update_by,
          status: result[i].status
        };
        obats[i]=obat;
      }
      res.status(config.http_code.ok);
      res.json(obats);
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
  update: function(req, res){
    let params = req.body;
    for(let i=0; i<req.body.product.length; i++){
      let product = req.body.product[i];
      let admin_name = jwt.decode(params.token, config.jwt_signature).user;
      let current_time = new Date();;
      let params_update =[product.name, product.description, product.member_price, product.non_member_price, current_time, admin_name, product.status, product.product_id];
      let query_cmd_update = "UPDATE product SET name=?, description=?, member_price=?, non_member_price=?, last_update_date=?, last_update_by=?, status=? WHERE product_id= ?;"
      console.log(mysql.format(query_cmd_update, params_update));
    }
    res.json("asd");
  }
};
 
module.exports = product_service;