var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var product_service = {
  create: function(req, res) {
    let query_cmd_prd_id = "SELECT CONCAT('prd_',max(CAST(SUBSTRING(product_id,5,30) as UNSIGNED))+1) as prd_id from product;"
    query(query_cmd_prd_id)
    .then(function(result){
      //console.log(result[0].prd_id);
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
          return res.json("error: " +err);  
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
    })
    .catch(function(error){
            console.log("error: "+error);
            res.status(config.http_code.in_server_err);
            res.json({
                "status": config.http_code.in_server_err,
                "message": "Internal Server Error"
            })
    });
  },
  search: function(req, res){
    let obats = new Array();
    let images = new Array();
    let obat = new Object();
    waterfall([
      function getMasterProduct(callback){
        let params_select =['%'+req.query.keyword+'%', '%'+req.query.keyword+'%'];
        let query_cmd_select = "SELECT * FROM product WHERE (name LIKE ? OR description LIKE ?) AND status ='active';"
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
                product_images:images 
              };
              obats[i]=obat;
            }
            callback(null, obats);
          })
      },
      function getProductImages(obats, result){
        var counter = 0;
        for(let i=0; i<obats.length; i++){
          let query_cmd_select = "SELECT product_id, url FROM attachment_url WHERE product_id = ?;"
          let params_select = [obats[i].product_id];
          product_service.get_single_images(params_select,function(x){
            obats[i].product_images = x;
            data();
          });
        }
        function data(){
          counter++;
          if(counter == obats.length){
            result(null, obats);
          }
        }
      }
    ], 
      function (err, result){
        res.status(config.http_code.ok);
        res.json(result);
      }
    );
  },
  get_single_images: function(prd_id, result){
    let params_select = [prd_id];
    let query_cmd_select = "SELECT product_id, url FROM attachment_url WHERE product_id = ?;"
    var images = [];
    query(mysql.format(query_cmd_select, params_select)).then(function(images_data){
      for(let j=0; j<images_data.length; j++){
        images[j] = "/images/"+images_data[j].url;
      }
      result(images);
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
    let counter = 0;
    for(let i=0; i<req.body.product.length; i++){
      product_service.update_single_product(req.body.product[i], req.body.token, function(result){
        report();
        if(result!="success"){
          i=req.body.product.length
          res.status(config.http_code.in_server_err);
          res.json({
              "status": config.http_code.in_server_err,
              "message": "Internal Server Error"
          });
        }
      });
    }
    function report(){
      counter++;
      if(req.body.product.length == counter){
        res.status(config.http_code.ok);
        res.json({
          "status": 200,
          "message": "Successfully Updated"
      });
      }
    }
  },
  update_single_product: function(product, token, callback){
    let admin_name = jwt.decode(token, config.jwt_signature).user;
    let current_time = new Date();
    let params_update =[product.name, product.description, product.member_price, product.non_member_price, current_time, admin_name, product.status, product.product_id];
    let query_cmd_update = "UPDATE product SET name=?, description=?, member_price=?, non_member_price=?, last_update_date=?, last_update_by=?, status=? WHERE product_id= ?;"
    //console.log(product);
    //console.log(mysql.format(query_cmd_update, params_update));
    query(mysql.format(query_cmd_update, params_update))
    .then(function(result){
      callback("success");
    })
    .catch(function(error){
      console.log("error: "+error);
      callback("error");
    });
  },
  buy: function(req, res){
    let user_name = jwt.decode(req.body.token, config.jwt_signature).user;
    let current_time = new Date();
    let query_cmd_transID = "SELECT CONCAT('transID_',max(CAST(SUBSTRING(transaction_id,9,30) as UNSIGNED))+1) as trans_id from transaction_history;";
    query(query_cmd_transID).then(function(result_1){
      console.log(result_1);
      let params_insert =[result_1[0].trans_id, user_name, current_time, '0'];
      let query_cmd_insert = "INSERT INTO transaction_history (transaction_id, user_id, order_date, state) "+
      "VALUES (?,?,?,?)"; 
      query(mysql.format(query_cmd_insert, params_insert)).then(function(result_2){
        for(let i=0; i<req.body.product.length; i++){
          product_service.buy_single_product(result_1[0].trans_id, req.body.product[i], function(result){
            console.log("a");
            res.json("buy");
          })
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
  buy_single_product: function(trans_id, product, callback){
    let params_insert =[trans_id, product.product_id, product.quantity];
    let query_cmd_insert = "INSERT INTO transaction_detail (transaction_id, product_id, quantity) "+
    "VALUES (?,?,?)";
     query(mysql.format(query_cmd_insert, params_insert)).then(function(result_3){
          callback("success");
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
};
 
module.exports = product_service;