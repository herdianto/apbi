var express = require('express');
var router = express.Router();
var config = require('../config/config.json');
 
var auth = require('./auth_service');
var user_service = require('./user_service');
var product_service = require('./products_service');

//favicon.ico request
router.get('/favicon.ico', function(req, res) {
    res.status(204);
    // to do: enhance
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
router.post('/api/admin/product/search', product_service.search_admin);
router.post('/api/admin/product/insert', product_service.create);
router.post('/api/admin/product/update', product_service.update);

module.exports = router;