var express = require('express');
var router = express.Router();

var monitor_controller = require('../controllers/monitor_controller');


router.get('/monitor', function(req, res){
    res.render('monitor');
});

module.exports = router;
