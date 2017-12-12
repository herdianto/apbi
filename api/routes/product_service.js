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
          callback(null, './static/product_images');
        },
        filename: function(req, file, callback){
          callback(null, result[0].prd_id + "_" + file_number+path.extname(file.originalname));
          file_number = file_number + 1;
        }
      });
      var upload = multer({storage: storage}).array('photos', 3); //max can upload 3 photos
      upload(req, res, function(err){
        if(err){
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Upload Failed"
          });
          return;
        }
        else{
          let params = req.body;
          let headers = req.headers;
          let token = headers['x-token'];
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
  validate_transaction: function(req, res){
    let data = req.body;
    let token = jwt.decode(data.token, config.jwt_signature);
    let current_time = new Date();
    var field = "";
    if(data.status == 0) field = "order_canceled_date";
    else if(data.status == 3 ) field = "order_confirmed_date";
    else if(data.status == 4 ) field = "delivery_date";
    else if(data.status == 5 ) field = "transaction_done_date";
    query_cmd_update = "UPDATE transaction_history SET "+
    "state = ? , "+ field + "= ? , last_updated_by = ? "+
    "WHERE transaction_id = ?";
    param_update = [data.status, current_time, token.user, data.trans_id];
    query(mysql.format(query_cmd_update, param_update)).then(function(data){
      if(data.affectedRows == 0){
        res.status(config.http_code.ok);
        res.json({
          "status": config.http_code.ok,
          "message": "No Record updated"
        })
      }else{
        res.status(config.http_code.ok);
        res.json({
          "status": config.http_code.ok,
          "message": "Update success"
        })
      }
    }).catch(function(error){
      console.log("error: "+error);
      res.status(config.http_code.in_server_err);
      res.json({
        "status": config.http_code.in_server_err,
        "message": "Internal Server Error"
      });
    });
  },
  upload_tr_proof: function(req, res){
    let trans_id = "";
    let token = jwt.decode(req.headers['x-token'], config.jwt_signature);
    let storage = multer.diskStorage({
      destination: function(req, file, callback){
        callback(null, './static/payment_images');
      },
      filename: function(req, file, callback){
        trans_id = req.body.trans_id;
        callback(null, token.user + "_" + trans_id + path.extname(file.originalname));
      }
    });
    let upload = multer({storage: storage}).single('payment_proof');
    upload(req, res, function(err){
      if(err){
        console.log("error: "+error);
        res.status(config.http_code.in_server_err);
        res.json({
          "status": config.http_code.in_server_err,
          "message": "Upload Failed"
        });
        return;
      }else{
        let current_time = new Date();
        params =[trans_id, req.file.filename, current_time];
        query_cmd_select = "SELECT COUNT(transaction_id) as no FROM attachment_url WHERE transaction_id = ? AND url = ?;";
        query(mysql.format(query_cmd_select, params)).then(function(result){
          if(result[0].no == 0){
            query_cmd_update = "UPDATE transaction_history SET "+
            "state = '2',  payment_proof_uploaded_date = ?"+
            "WHERE transaction_id = ?";
            query(mysql.format(query_cmd_update, params));
            query_cmd_insert = "INSERT INTO attachment_url (transaction_id, url) values (?,?);";
            query(mysql.format(query_cmd_insert, params)).then(function(transactions){
            res.status(config.http_code.ok);
            res.json({
            "status": config.http_code.ok,
            "message": "Upload Success"
          })
          }).catch(function(error){
            console.log("error: "+error);
            res.status(config.http_code.in_server_err);
            res.json({
              "status": config.http_code.in_server_err,
              "message": "Internal Server Error"
            });
          });   
          }else{
            res.status(config.http_code.ok);
            res.json({
              "status": config.http_code.ok,
              "message": "Upload Success"
            })
          }          
        });            
      }
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
        images[j] = "/product_images/"+images_data[j].url;
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
    waterfall([
      function getProductPrice(callback_1){
        let param_cmd_membership = [jwt.decode(req.body.token, config.jwt_signature).user];
        let query_cmd_membership = "SELECT role FROM apbi_user where user_id = ?";
        query(mysql.format(query_cmd_membership, param_cmd_membership)).then(function(result_1){
          callback_1(null, result_1[0].role);
        });
      },
      function buy_products(membership, callback_2){
        let user_name = jwt.decode(req.body.token, config.jwt_signature).user;
        let current_time = new Date();
        let query_cmd_transID = "SELECT CONCAT('transID_',ifnull(max(CAST(SUBSTRING(transaction_id,9,30) as UNSIGNED)),0)+1) as trans_id from transaction_history;";
        query(query_cmd_transID).then(function(result_1){
          let counter = 0;
          let params_insert =[result_1[0].trans_id, user_name, current_time, '1'];
          let query_cmd_insert = "INSERT INTO transaction_history (transaction_id, user_id, order_date, state) "+
          "VALUES (?,?,?,?)";
          query(mysql.format(query_cmd_insert, params_insert)).then(function(result_2){
            for(let i=0; i<req.body.product.length; i++){
              product_service.buy_single_product(result_1[0].trans_id, req.body.product[i], membership, function(result){
                report();
              })
            }
            function report(){
              counter++;
              if(req.body.product.length == counter){
                callback_2(null, "OK");
                return;
              }
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
      }],
      function (err, result){
        if(!err){
          res.status(config.http_code.ok);
          res.json({
            "status": 200,
            "message": "Successfully Bought"
            });
        }else{
          console.log("error: "+err);
          res.status(config.http_code.in_server_err);
          res.json({
            "status": config.http_code.in_server_err,
            "message": "Internal Server Error"
          });
        }
      }
    )
  },
  buy_single_product: function(trans_id, product, membership, callback){
    let params_insert =[trans_id, product.product_id, product.quantity, product.product_id];
    if(membership == "member"){
      query_cmd_insert = "INSERT INTO transaction_detail (transaction_id, product_id, quantity, price) "+
      "SELECT ?,?,?, member_price FROM product WHERE product_id = ?";
    }else{
      query_cmd_insert = "INSERT INTO transaction_detail (transaction_id, product_id, quantity, price) "+
      "SELECT ?,?,?, non_member_price FROM product WHERE product_id = ?";
    }
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
      }
    );
  },
  get_transaction: function(req, res){
    let token = jwt.decode(req.headers['x-token'], config.jwt_signature);
    let user_name = token.user; 
    let role = token.role;
    let transaction_lists = new Array();
    let products = new Array();
    let y=0;
    let x=0;
    let params_select, query_cmd_select;
    if(role == "admin"){
      params_select =[];
      query_cmd_select =
      "SELECT  t1.*, z.url from (SELECT b.transaction_id, b.order_date, b.payment_proof_uploaded_date, b.order_confirmed_date, b.delivery_date, b.transaction_done_date, b.state, " +
      "a.price, a.quantity, "+
      "c.product_id, c.name "+
      "FROM transaction_detail a, transaction_history b, product c, apbi_user d "+
      "WHERE a.transaction_id = b.transaction_id "+
      "AND d.user_id = b.user_id "+
      "AND a.product_id = c.product_id "+
      "ORDER BY b.order_date ASC) t1 LEFT JOIN attachment_url z ON z.transaction_id = t1.transaction_id"
    }else{
      params_select =[user_name];
      query_cmd_select =
      "SELECT  t1.*, z.url from (SELECT b.transaction_id, b.order_date, b.payment_proof_uploaded_date, b.order_confirmed_date, b.delivery_date, b.transaction_done_date, b.state, " +
      "a.price, a.quantity, "+
      "c.product_id, c.name "+
      "FROM transaction_detail a, transaction_history b, product c, apbi_user d "+
      "WHERE a.transaction_id = b.transaction_id "+
      "AND d.user_id = b.user_id "+
      "AND a.product_id = c.product_id "+
      "AND d.user_id = ? "+
      "ORDER BY b.order_date ASC) t1 LEFT JOIN attachment_url z ON z.transaction_id = t1.transaction_id;"
    }
    query(mysql.format(query_cmd_select, params_select)).then(function(transactions){
      var trans = new Array();
      for(let i=0; i<transactions.length; i++){
        trans[i] = transactions[i].transaction_id;
      }
      trans = Array.from(new Set(trans));

      for(let h=0; h<trans.length; h++){
        products = new Array();
        let transaction_list = new Object;
        x = 0;
        for(let i=0; i<transactions.length; i++){
          if(trans[h] == transactions[i].transaction_id){
            //add product
            let product = new Object;
            product.id = transactions[i].product_id;
            product.name = transactions[i].name;
            product.price = transactions[i].price;
            product.quantity = transactions[i].quantity;
            products[x] = product;
            x++;

            //transaction
            if(x==1){
              transaction_list.id = trans[h];
              transaction_list.order_date = transactions[i].order_date;
              transaction_list.payment_proof_date = transactions[i].payment_proof_uploaded_date;
              transaction_list.order_confirmed_date = transactions[i].order_confirmed_date;
              transaction_list.delivery_date = transactions[i].delivery_date;
              transaction_list.transaction_done_date = transactions[i].transaction_done_date;
              if(transactions[i].url != null){
                transaction_list.payment = "/api/images/payment/"+transactions[i].url;
              }
              let status = "";
              switch(parseInt(transactions[i].state)){
                case 0: status = config.order_status.canceled; break;
                case 1: status = config.order_status.created; break;
                case 2: status = config.order_status.payment; break;
                case 3: status = config.order_status.confirmed; break;
                case 4: status = config.order_status.delivery; break;
                case 5: status = config.order_status.completed; break;
              }
              transaction_list.status = status;
            }
          }
        }
        //add transaction
        transaction_list.product = products;
        transaction_lists[h] = transaction_list;
      }
      res.json(transaction_lists);
    });
  },
  get_product_detail: function(req, res){
    let prod_images = new Array();
    let product = new Object();
    let params_select =[req.params.prod_id];
    query_cmd_select = "SELECT t1.*, z.url FROM "
    +"(SELECT product_id, name, description, member_price, non_member_price, posted_date, posted_by, last_update_date, last_update_by from product where product_id = ?) t1 "
    +"LEFT JOIN attachment_url z ON z.product_id = t1.product_id";
    query(mysql.format(query_cmd_select, params_select)).then(function(result){
        for(let i=0; i<result.length; i++){
          if(i==0){
            product.id = result[i].product_id;
            product.description = result[i].description;
            product.name = result[i].name;
            product.member_price = result[i].member_price;
            product.non_member_price = result[i].non_member_price;
            product.posted_date = result[i].posted_date;
            product.posted_by = result[i].posted_by;
            product.last_update_date = result[i].last_update_date;
            product.last_update_by = result[i].last_update_by;
          }
          if(result[i].hasOwnProperty('url') && result[i].url != null){
            prod_images[i] = "/product_images/"+result[i].url;
          }
        }
        product.images = prod_images;
        res.json(product);
      }
    );
  },
  get_product_list: function(req, res){
    let obats = new Array();
    let images = new Array();
    let obat = new Object();
    waterfall([
      function getMasterProduct(callback){
        let limit = config.select_limit.product;
        let page_number = req.params.page;
        let params_select =[(page_number-1)*limit, limit];
        let query_cmd_select = "SELECT * FROM product LIMIT ?,?;"
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
        if(obats.length > 0){
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
        }else{
          let obat = new Array();
          result(null, obat);
        }
      }
    ], 
      function (err, result){
        res.status(config.http_code.ok);
        res.json(result);
      }
    );
  }
};
 
module.exports = product_service;