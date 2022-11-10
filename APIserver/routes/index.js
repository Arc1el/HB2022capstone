var express = require('express');
var os = require('os');
var router = express.Router();
const pbkdf2 = require('pbkdf2-password');
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig);
connection.connect();

//root접속
router.get('/', function(req, res, next) {
  var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  res.send(seq);
  try{
    connection.query('SELECT * from member', (error, rows, fields) => {
      if (error) throw error;
      console.log('User info dis: ', rows);
    });
    
  }catch(err){
    console.log(err);
  }
  //res.render('index', { title: seq });
});

router.get('/api/getHomeImages', function(req, res){
  os.chdir('/home/dfx/dist/img');
  filelist = os.listdir();
  res.send(JSON.stringify(filelist));
});

//confirmEmail
router.post('/api/confirmEmail', function(req, res){
  canuse = 'n';
  const {email} = req.body;
  sql = "select * from member where email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      console.log(rows[0]);
      if(rows[0] == undefined){
        canuse = 'y'
      }
      res.send(canuse);
    } 
  });
});

router.post('/api/getUser', function(req, res){
  const {email} = req.body;
  sql = "select * from member where email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      console.log(rows[0]);
      json_dat = JSON.stringify(rows[0]);
      res.send(json_dat);
    } 
  });
});

router.get('/api/getUsers', function(req, res){
  sql = "select * from member";
  
  connection.query(sql, (error, dat, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      rows = []
      for (i = 0; i < dat.length; i++){
        console.log(dat[i].email);
        content = {
          'email' : dat[i].email,
          'password' : dat[i].password,
          'name' : dat[i].name,
          'phone' : dat[i].phone,
          'memlevel' : dat[i].memlevel,
          'avatar' : dat[i].avatar
        }
        rows.push(content);
      }

      json_dat = JSON.stringify(rows);
      res.send(json_dat);
    }
  });
});

router.post('/api/getFindUsers', function(req, res){
  const {name} = req.body;
  console.log(name);
  sql = "select *  from member where name like " + "'" +  name + "'";
  let row;
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      console.log(rows);
      row = rows[0];
      res.send(JSON.stringify(row));
    } 
  });
});

router.post('/api/login', function(req, res){
  const {email, password} = req.body;
  sql = "select * from member where email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      enpassword = rows[0].password;
      split_data = enpassword.split(":");
      salt = split_data[0];
      hash = split_data[1];

      const login_hasher = pbkdf2();
      login_hasher({password : password, salt}, (error, pw2, salt2, hash2) => {
        if(error) console.log(error)
        else{
          if(hash == hash2){
            console.log("success");
            console.log("hash1(db) : " + hash);
            console.log("hash2(user) : " + hash2);
            
            row = [rows[0].email, rows[0].password, rows[0].name, rows[0].phone, rows[0].memlevel, rows[0].avatar]

            res.send(JSON.stringify(row));
          }
          else{
            console.log("failed");
            console.log("hash1(db) : " + hash);
            console.log("hash2(user) : " + hash2);
            res.send(false);
          }
        }
      });
    } 
  });

});

router.post('/api/memberRegister', function(req, res){
  const {email, password, name} = req.body;
  console.log(email, password, name);

  const register_hasher = pbkdf2();
  register_hasher({password}, (error, pw, salt, hash) => {
    if(error){
      console.log(error);
      return;
    }else{
      console.log("pw : " + pw + "salt : " + salt + " hash : " + hash);
      enpassword = salt + ":" + hash;
      sql = "insert into member(email, name, password)values('" 
      + email + "','" + name + "','" + enpassword + "')";

      connection.query(sql, (error, rows, fields) => {
        if (error) {
          console.log(error);
        }
        else{
          
          res.send("good");
        } 
      });
    }
  })
});

router.post('/api/memberUpdate', function(req, res){
  const {email, password, name, phone} = req.body;
  enpassword = password;
  console.log(email, password, name, phone, enpassword);

  if(password.length < 30){
    const update_hasher = pbkdf2();
    update_hasher({password}, (error, pw, salt, hash) => {
      if(error){
        console.log(error);
        return;
      }else{
        console.log("pw : " + pw + "salt : " + salt + " hash : " + hash);
        enpassword = salt + ":" + hash
        sql = "update member set name='" + name + "',password='" 
        + enpassword + "',phone='" + phone + "' where email='" + email + "'";
        connection.query(sql, (error, rows, fields) => {
          if (error) {
            console.log(error);
          }
          else{
            res.send("success");
          } 
        });
      }
    })
  }
});

router.post('/api/userLevelUpdate', function(req, res){
  const {email, memlevel} = req.body;
  sql = "update member set memlevel='" + memlevel + "' where email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      res.send("success");
    } 
  });
});

router.post('/api/userDelete', function(req, res){
  const {email} = req.body;
  sql = "delete from member where email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      res.send("success");
    } 
  });
});

router.post('/api/addChatGroup', function(req, res){
  const {groupname, email, name} = req.body;
  sql = "select group_name from chatgroup where group_name ='" 
  + groupname + "' and part_email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      if(rows[0] != undefined){
        nowdate = new Date();
        year = nowdate.getFullYear().toString().padStart(4, '0');
        month = (nowdate.getMonth()+1).toString().padStart(2, '0');
        day = nowdate.getDate().toString().padStart(2, '0');
        hours = nowdate.getHours().toString().padStart(2, '0');
        minutes = nowdate.getMinutes().toString().padStart(2, '0');
        date_str = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
        console.log(date_str);

        sql = "insert into chatgroup(group_seq,group_name,part_email,part_name,create_date)" 
        + "values((select IFNULL(MAX(T.group_seq),0) + 1 from chatgroup T),'" + groupname
        + "','" + email + "','" + name + "','" + date_str + "')";

        connection.query(sql, (error, rows, fields) => {
          if (error) {
            console.log(error);
          }
          else{
            res.send("good");
          } 
        });
      }
    } 
  });
});

router.get('/api/getGroup', function(req, res){
  sql = "select group_name from chatgroup group by group_name";
  
  connection.query(sql, (error, dat, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      rows = []
      for (i = 0; i < dat.length; i++){
        console.log(dat[i].email);
        content = {
          'group_name' : dat[i].group_name
        }
        rows.push(content);
      }

      json_dat = JSON.stringify(rows);
      res.send(json_dat);
    }
  });
});

router.post('/api/sensorInsert', function(req, res){
  json_data = JSON.stringify(req.body);
  sen0101 = json_data.sen01.val01;
  sen0102 = json_data.sen01.val02;
  sen0201 = json_data.sen02.val01;
  sen0202 = json_data.sen02.val02;

  nowdate = new Date();
  year = nowdate.getFullYear().toString().padStart(4, '0');
  month = (nowdate.getMonth()+1).toString().padStart(2, '0');
  day = nowdate.getDate().toString().padStart(2, '0');
  hours = nowdate.getHours().toString().padStart(2, '0');
  minutes = nowdate.getMinutes().toString().padStart(2, '0');
  seconds = nowdate.getSeconds().toString().padStart(2, '0');
  date_str = year + "년" + month + "월" + day + "일" + hours + "시" + minutes + "분" + seconds + "초";

  fromroom = "room01";

  sql = "insert into sensor(data0101,data0102,data0201,data0202,inputdate,fromroom)values('"
  + sen0101 + "','" + sen0102 + "','" + sen0201 + "','" + sen0202 + "','" + date_str + "','" + fromroom+ "')";
  
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
      res.send("fail");
    }
    else{
      res.send("success");
    } 
  });
});

router.post('/api/motionSensor', function(req, res){
  json_data = JSON.stringify(req.body);
  id = json_data.sen01.id;
  cla = json_data.sen01.class;

  nowdate = new Date();
  year = nowdate.getFullYear().toString().padStart(4, '0');
  month = (nowdate.getMonth()+1).toString().padStart(2, '0');
  day = nowdate.getDate().toString().padStart(2, '0');
  hours = nowdate.getHours().toString().padStart(2, '0');
  minutes = nowdate.getMinutes().toString().padStart(2, '0');
  seconds = nowdate.getSeconds().toString().padStart(2, '0');
  date_str = year + "년" + month + "월" + day + "일" + hours + "시" + minutes + "분" + seconds + "초";

  fromroom = "room01";

  sql = "insert into motionsensor(id,class,inputtime)values('"
  + id + "','" + cla + "','" + date_str + "')";
  
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
      res.send("fail");
    }
    else{
      res.send("success");
    } 
  });
});

router.post('/api/forgetPassword', function(req, res){
  const {email} = req.body;
  sql = "select * from member where email='" + email + "'";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      if(rows[0] != undefined){
        password = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

        transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'ezpos1007@gmail.com',
            pass: 'iiyyeyyopieuhcux',
          },
        });

        contexttext = '내용 : 임시 비밀번호는 : '+ password + '입니다.\r\n'
        contexttext += '로그인 하여 재설정하시기 바랍니다.'

        info = transporter.sendMail({
          from: `"G farm" <ezpos1007@gmail.com>`,
          to: email,
          subject : "제목 : G Farm 비밀번호 재설정 메일입니다.",
          text: contexttext
        });

        const forget_hasher = pbkdf2();
        forget_hasher({password}, (error, pw, salt, hash) => {
          if(error){
            console.log(error);
            return;
          }else
          {
            enpassword = salt + ":" + hash;
            sql = "update member set password='" + enpassword + "' where email='" + email + "'";

            //console.log("password : " + password + "\n\r" + "pw : " + pw + "\n\r" + "salt : " + salt + "\n\r" + " hash : " + hash + "\n\r");
            connection.query(sql, (error, rows, fields) => {
              if (error) {
                console.log(error);
              }
              else{
                res.send("exists");
                console.log("success \n\r");
              } 
            });
          }
        })
      }else{
        res.send("nothing")
      }
    } 
  });
});




/*
router.get('', function(req, res){
  sql = "";
  connection.query(sql, (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
    else{
      console.log(rows);
      row = rows[0];
      res.send(row)
    } 
  });
});
*/

module.exports = router;
