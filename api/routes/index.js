var express = require('express');
var router = express.Router();
var config = require('../config/config.json');
 
var auth = require('./auth_service');
var user_service = require('./user_service');
var product_service = require('./product_service');
var forum_service = require('./forum_service');
var about_service = require('./about_service');
var news_service = require('./news_service');

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
router.get('/api/admin/member_list', user_service.get_member_list);
router.post('/api/display_profile', user_service.display_profile);

//about servie
router.post('/api/admin/about/post_about', about_service.post_about);
router.get('/about/get_about', about_service.get_about);
router.get('/about/api/admin/get_about', about_service.get_about_admin);
router.post('/api/admin/about/edit_about', about_service.edit_about);

//news servie
router.post('/api/admin/news/post_news', news_service.post_news);
router.get('/news/get_news', news_service.get_news);
router.get('/api/admin/news/get_news', news_service.get_news_admin);
router.post('/api/admin/news/edit_news', news_service.edit_news);
router.get('/news/search', news_service.search_news);
 
//product service
router.get('/api/product/search', product_service.search);
router.get('/api/product/get_product_list/:page', product_service.get_product_list);
router.post('/api/product/buy', product_service.buy);
router.get('/api/product/detail/:prod_id', product_service.get_product_detail);
router.get('/api/admin/product/get_transaction/:page', product_service.get_transaction);
router.get('/api/product/get_transaction/:page', product_service.get_transaction);
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
router.get('/api/forum/get_comment', forum_service.get_comment);


module.exports = router;