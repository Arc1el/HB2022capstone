var express = require('express');
var router = express.Router();

var manage_controller = require('../controllers/manage_controller');

/* GET users listing. */
router.get('/manage', async function(req, res) {
    if(!req.session.user){
        //로그인 안 되어 있으면 redirect
        res.redirect('login');
    }else{
        var result = await manage_controller.memList(req);
        //console.log(result);
        res.render('manage',{
            users: result,
            user: req.session.user.data
          });
    }
});

router.get('/manage_detail', async function(req, res) {
    if(!req.session.user){
        //로그인 안 되어 있으면 redirect
        res.redirect('login');
    }else{
        var result = {
            name:req.query.name,
            userid:req.query.userid,
            password:req.query.password,
            salt:req.query.salt,
            date:req.query.date
        }
        res.render('manage_detail',{
            users: result,
            user: req.session.user.data
          });
    }
});

module.exports = router;
