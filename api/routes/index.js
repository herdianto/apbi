var express = require('express');
var router = express.Router();
var config = require('../config/config.json');
 
var auth = require('./auth_service');
var user_service = require('./user_service');
var product_service = require('./product_service');
var forum_service = require('./forum_service');

//favicon.ico request
router.get('/favicon.ico', function(req, res) {
    res.status(204);
    // to do: enhance to display website icon
    //res.status(config.http_code.ok);
    //res.res.sendFile('../favicon.png');
});

//user service
router.post('/login', auth.login);
router.post('/register', user_service.register);
router.post('/forget', user_service.forget);
router.get('/forget_action', user_service.apply_password);
router.post('/api/refresh_token', auth.renew_token);
router.post('/api/update_profile', user_service.update_profile);
router.post('/api/admin/member_approval', user_service.set_member_status);
 
//product service
router.get('/api/product/search', product_service.search);
router.post('/api/product/buy', product_service.buy);
router.get('/api/admin/product/get_transaction', product_service.get_transaction);
router.get('/api/product/get_transaction', product_service.get_transaction);
router.post('/api/admin/product/search', product_service.search_admin);
router.post('/api/admin/product/insert', product_service.create);
router.post('/api/admin/product/update', product_service.update);
router.post('/api/product/upload_trans_proof', product_service.upload_tr_proof);
router.post('/api/admin/product/validate_transaction', product_service.validate_transaction);

//forum service
router.post('/api/forum/add_thread', forum_service.add_thread);
router.post('/api/forum/update_thread', forum_service.update_thread);
router.post('/api/forum/add_comment', forum_service.add_comment);
router.post('/api/forum/delete_comment', forum_service.delete_comment);
router.get('/api/forum/view_thread', forum_service.view_thread);

module.exports = router;