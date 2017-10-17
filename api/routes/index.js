var express = require('express');
var router = express.Router();
 
var auth = require('./auth_service');
var user_service = require('./user_service');
var products = require('./products_service');

 
//user service
router.post('/login', auth.login);
router.post('/register', user_service.register);
router.post('/forget', user_service.forget);
router.get('/forget_action', user_service.apply_password);
router.post('/api/refresh_token', auth.renew_token);
router.post('/api/update_profile', user_service.update_profile);
router.post('/api/admin/member_approval', user_service.set_member_status);
 
//product service
router.get('/api/v1/products', products.getAll);
router.get('/api/v1/product/:id', products.getOne);
router.post('/api/v1/product/', products.create);
router.put('/api/v1/product/:id', products.update);
router.delete('/api/v1/product/:id', products.delete);
 
module.exports = router;