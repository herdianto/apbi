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
    res.json("add thread");
  },
  update_thread: function(req, res){
    res.json("update thread");
  },
  add_comment: function(req, res){
    res.json("add comment");
  },
  delete_comment: function(req, res){
    res.json("delete comment");
  },
  view_thread: function(req, res){
    res.json("view thread");
  }
};
 
module.exports = forum_service;