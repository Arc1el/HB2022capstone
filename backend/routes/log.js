const express = require('express');
const router = express.Router();

var log_controller = require('../controllers/log_controller');
var info_controller = require('../controllers/info_controller');

//login 구현
router.get('/login', function(req, res) {
    console.log(req.session);
    if(!req.session.user){
        res.render('log/login');
    }else{
        //이미 로그인된 유저 로그인
        res.redirect('/');
    }
});

router.post('/login', async function(req, res){
    //로그인위한 컨트롤러 호출
    var result = await log_controller.SignIn(req, res);
    console.log(result);
    req.session.user = result;
    //console.log(result);
    res.send(result);

});

//logout 구현
router.get('/logout', function(req, res){
    //쿠키제거
    res.clearCookie('userid');
    res.clearCookie('username');

    //세션정보 삭제
    req.session.destroy();
    res.redirect('/');
});

// signup 구현
router.get('/signup', function(req,res){
    res.render('log/signup');
});

router.post('/signup', async function(req, res){
    //회원가입 위한 컨트롤러 호출
    var result = await log_controller.SignUp(req, res);
    res.send(result);
});

// info page
router.get('/info', async function(req, res){

    if(!req.session.user){
      //로그인 안 됨
      res.render('_demo',{
        user: "N",
      });
    }else{
      //로그인 됨

      var tempPet = await info_controller.InfoList(req, req.session.user.data.userid);


      console.log(tempPet);

      res.render('_info', {
        user: req.session.user.data,
        pet : tempPet
      });
    }
  });

  // regist pet
  router.get('/registpet', function(req,res){
    res.render('_registform');
  });

  router.post('/registpet', async function(req, res){
    var resCode = await info_controller.registPet(req, req.session.user.data.userid);
    var msg;
    if (resCode == 100) {
      msg = "존재하지 않는 디바이스입니다";
    }

    res.send({code:resCode,msg:msg});

  });

module.exports = router;