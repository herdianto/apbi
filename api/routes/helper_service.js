var multer = require('multer');
var jwt = require('jwt-simple');
var date = require('date-and-time');
var query = require('../helper/db_connection');
var config = require('../config/config.json');
var mysql = require('mysql');
var path = require('path');
var waterfall = require('a-sync-waterfall');

var helper_service = {
  upload_images: function(req, res){
    waterfall([
      function getID(id){
        let query_cmd_select = "SELECT ifnull(max(id),0) as id from public_images limit 1";
        query(query_cmd_select).then(function(result_1){
          id(null, result_1[0].id+1);
        });
      },
      function upload_picture(id, isUploaded){
        let pic = '';
        let decoded = jwt.decode(req.headers["x-token"], config.jwt_signature);
        var storage = multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, './static/public_images');
        },
        filename: function(req, file, callback){
          //if(decoded.user == req.body.user_id){
            //console.log(file);
            pic = id+"_"+file.originalname; //+path.extname(file.originalname)
            callback(null, pic);
          //}else{
          //  callback(null, null);
          //}
        }
        });
        var upload = multer({storage: storage}).array('images', 1); //max can upload 1 photo
        upload(req, res, function(err){
          if(!err){
            isUploaded(null, pic, id);
          }else{
            isUploaded(null, null, null);
          }
        });
      },function insertforum(pic, id, insert){
        let data = req.body;
        let current_time = new Date();
        let user_name = jwt.decode(req.headers['x-token'], config.jwt_signature).user;
        let params_insert =[id, user_name, current_time, pic, pic, data.description];
        let query_cmd_insert = "INSERT INTO public_images (id, uploader, upload_date, original_file, resized_file, description) values (?,?,?,?,?,?);"
        console.log(mysql.format(query_cmd_insert, params_insert));
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
  get_images: function(req, res){
    let page = req.params.page;
    if (page < 1) page = 1; 
    let limit = config.select_limit.images;
    let query_cmd = "SELECT * FROM public_images limit ?,?";
    let query_params = [(page-1)*limit, limit];
    let images = new Array();
    //console.log(page+"aa"+limit);
    query(mysql.format(query_cmd, query_params)).then(function(data){
      for(let i=0; i<data.length; i++){
        let image = new Object();
        image.url = "/public_images/"+data[i].original_file;
        image.description = data[i].description;
        image.uploader = data[i].uploader;
        image.upload_date = data[i].upload_date;
        images[i] = image;
      }
      res.status(config.http_code.ok);
      res.json(images);
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
 
module.exports = helper_service;