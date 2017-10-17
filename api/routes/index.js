var express = require('express');
var router = express.Router();
 
var auth = require('./auth');
var user_service = require('./user_service');
var products = require('./products');
var user = require('./users');

 
/*
 * Routes that can be accessed by anyone
 */
router.post('/login', auth.login);
router.post('/register', user_service.register);
router.post('/forget', user_service.forget);
router.get('/forget_action', user_service.apply_password);
 
/*
 * Routes that can be accessed only by autheticated users
 */
router.get('/api/v1/products', products.getAll);
router.get('/api/v1/product/:id', products.getOne);
router.post('/api/v1/product/', products.create);
router.put('/api/v1/product/:id', products.update);
router.delete('/api/v1/product/:id', products.delete);
 
/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/v1/admin/users', user.getAll);
router.get('/api/v1/admin/user/:id', user.getOne);
router.put('/api/v1/admin/user/:id', user.update);
router.delete('/api/v1/admin/user/:id', user.delete);

router.post('/api/refresh_token', auth.renew_token);
router.post('/api/update_profile', user_service.update_profile);
router.post('/api/admin/member_approval', user_service.set_member_status);
 
module.exports = router;