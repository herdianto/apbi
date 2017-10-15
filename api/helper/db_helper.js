var mysql = require('mysql');
var Promise = require('bluebird');
var using = Promise.using;
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'herdi',
  port: '3309',
  password: 'herdi',
  database: 'apbi'
});

var getConnection = function () {
 return pool.getConnectionAsync().disposer(function (connection) {
 return connection.destroy();
 });
};
var query = function (command) {
 return using(getConnection(), function (connection) {
 return connection.queryAsync(command);
 });
};

module.exports = query;

// var user_management = {
//     getUserById : function(req, res) {
//       req = 'herdi';
//       var params = [req];
//       var query_cmd = 'SELECT * FROM user LIMIT 3;';
//       //var query_cmd = 'SELECT * FROM user WHERE user_id = ? LIMIT 3;';
//       query(mysql.format(query_cmd, params))
//       .then(function (r) {
//           var test = new Object();
//           var arr  = new Array();
//           //console.log(r.length);
//           for(var i=0; i<r.length; i++){
//             console.log(r[i].user_id);
//             test.id = r[i].user_id;
//             arr.push(test);
//           }
//           arr.push(r);
//           res.json(arr);
//       })
//       .catch(function(e){
//           console.log("z");
//           res.json(e);
//       });
//     },
//   test : function(req, res){
//     var params = new Array();
//     params[0] = '2017-09-14 20:22:00';
//     params[1] = 'nunu';
//     var query_cmd = 'UPDATE user SET last_login = ? WHERE user_id = ?;';
//     query(mysql.format(query_cmd, params)).
//     then(function(r){console.log(r)}).
//     catch(function(e){console.log(e)});
//     res.json("aaa");
//   }
// };
// module.exports = user_management;