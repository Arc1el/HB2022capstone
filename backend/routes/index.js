var express = require('express');
var router = express.Router();
var qs = require('querystring');
const fs = require('fs');

//mariaDB import
const maria = require('../database/connect/maria');

//json데이터 받아오기
router.post('/getdata', function(req, res){
  // console.log(req.body);
  data = req.body;
  fs.writeFileSync("./views/savedat_" + data.deviceid + ".json", JSON.stringify(data));
  fs.writeFileSync("./views/savedat.json", JSON.stringify(data));
  res.json(req.body);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  maria.query('select * from user', function(err, rows, fields) {
    if(!err) {
      //--- Navbar 기능 구현시 라우터에서 필요 코드 ---
      if(!req.session.user){
        //로그인 안 됨
        res.render('_demo',{
          user: "N",
        });
      }else{
        //로그인 됨
        res.render('_demo',{
          user: req.session.user.data,
        });
      //--- Navbar 기능 구현시 라우터에서 필요 코드 ---
    }
    } else {
      console.log("err : " + err);
      res.send(err);
    }
  });
});

router.get('/headertest', function(req, res, next) {
  res.render('septest');
});

// stream data upload
router.post('/streamdata', function(req, res){
  console.log(req.body);
});

// router.get('/query', function(req, res, next) {
  
//   maria.query('select * from member', function(err, rows, fields) {
//     if(!err) {
//       res.send(rows);
//     } else {
//       console.log("err : " + err);
//       res.send(err);
//     }
//   });
// });

// //생성 테스트
// router.get('/create', function(req, res){
//   maria.query(
//     'CREATE TABLE user ('+
//     'ID BIGINT AUTO_INCREMENT NOT NULL,'+
//     'USERID VARCHAR(50) NOT NULL,'+
//     'PASSWORD VARCHAR(500) NOT NULL,'+
//     'NAME VARCHAR(50) NOT NULL,'+
//     'SALT VARCHAR(100) NOT NULL,'+
//     'PRIMARY KEY (ID)', function(err, rows, fields)
//     {
//       if(!err){
//         res.send(rows);
//       }else {
//         console.log("err : " + err);
//         res.send(err);
//       }
//     });
// });

// //vue test
// router.get('/vuetest', function(req, res, next) {
//   res.render('../public/index');
// });

module.exports = router;
