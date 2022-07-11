var createError = require('http-errors');
var express = require('express');
var path = require('path');
const history = require('connect-history-api-fallback');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const fileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
const ws = require('ws');
const fs = require('fs');
const Blob = require('node-blob');
const multer = require('multer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var logRouter = require('./routes/log');
var uploadRouter = require('./routes/upload');
var manageRouter = require('./routes/manage');
var chatRouter = require('./routes/chat');
var boardRouter = require('./routes/board');
var monitorRouter = require('./routes/monitor');

var app = express(); //express패키를 호출하여 app 변수 객체를 만듦

//mariaDB 설정
//const maria = require('./database/connect/maria');
//maria.connect();

//익스프레스 앱 설정
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//미들웨어 연결
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
//app.use(express.static(path.join(__dirname, 'uploadedFiles')));

//세션 미들웨어
app.use(session({
  secret :"hospetter",
  resave:false,
  secure:true,
  saveUninitialized:true,
  store: new fileStore()
}));

//라우터 설정
app.use('/', indexRouter, logRouter, manageRouter, uploadRouter, chatRouter, boardRouter, monitorRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);

app.use(history());

// 404에러
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


const HTTPServer = app.listen(7000, () => {
  console.log("Server is open 7000 port.");
});

const websocketServer = new ws.Server({
  server: HTTPServer,
});

websocketServer.on('connection', (ws, req) => {
  // 클라이언트 ip 취득
  const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`새로운 클라이언트 [${client_ip}] 접속`);

  // 클라이언트에게 메세지 전송
  if(ws.readyState === ws.OPEN){  // 연결 여부 체크
    ws.send(`클라이언트 [${client_ip} 접속]`);
  }

  // 메세지 수신 이벤트 처리
  ws.on('message', async (msg) => {
     console.log(`클라이언트 [${client_ip}]에게 수신한 메시지 : ${msg}`);
     console.log(Object.keys(msg).length);
    /*
    const blob = new Blob(msg, { type: 'video/webm' });
  
    const buffer = Buffer.from( await blob.arrayBuffer());
  
    fs.writeFile('video.webm', buffer, () => console.log('video saved!'));
    */
     ws.send('메시지를 받았습니다 from 서버');
  });

  // 에러 
  ws.on('error', (error) => {
     console.log(`클라이언트 [${client_ip}] 연결 에러발생 : ${error}`);
  });
  
  // 연결 종료 이벤트 처리 
  ws.on('close', () => {
     console.log(`클라이언트 [${client_ip}] 웹소켓 연결 종료`);
  });
});

module.exports = app; //모듈로 만들기