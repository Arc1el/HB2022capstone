var express = require('express');
var router = express.Router();

var board_controller = require('../controllers/board_controller');

/* GET board listing. */
router.get('/board', async function(req, res) {
  if(!req.session.user){
      //로그인 안 되어 있으면 redirect
      res.redirect('login');
  }else{
      var result = await board_controller.boardList(req);
      console.log(result);
      res.render('_board',{
          users: result,
          user: req.session.user.data
        });
  }
});

router.get('/board_write', function(req, res){
  res.render('_board_write');
});

router.post('/board_write', async function(req, res){
  var result = await board_controller.boardWrite(req, res);
  console.log(result);
  req.session.title = result;
  res.send(result);
});

router.get('/board', async function(req, res) {
  if(!req.session.user){
      //로그인 안 되어 있으면 redirect
      res.redirect('login');
  }else{
      var result = {
          title: req.query.title,
          content: req.query.content,
          author: req.query.author,
          date: req.query.date
      }
      res.render('_board',{
        users: result,
        user: req.session.user.data
        });
  }
});

router.get('/board_detail', async function(req, res) {
  if(!req.session.user){
      //로그인 안 되어 있으면 redirect
      res.redirect('login');
  }else{
      var result = {
          title: req.query.title,
          author: req.query.author,
          content: req.query.content,
          date: req.query.date
      }
      
      res.render('_board_detail',{
          Users: result,
          user: req.session.user.data
        });
  }
});

router.get('/board_correct', function(req, res){
  res.render('_board_correct');
});

router.post('/board_correct', async function(req, res){
  if(!req.session.user){
    res.redirect('login');
  }else{
    var result = {
      title: req.query.title,
      author: req.query.author,
      content: req.query.content,
      date: req.query.date
    }

    res.render('_board_correct', {
      Users: result,
      user: req.session.user.data
    });
  }
});

module.exports = router;
