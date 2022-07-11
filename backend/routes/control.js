var express = require('express');
var router = express.Router();

// 제어 웹페이지로 이동
router.get('/_control', function(req, res){
    res.render('_control');
});