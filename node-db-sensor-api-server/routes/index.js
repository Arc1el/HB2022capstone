var express = require('express');
var router = express.Router();
var fs = require('fs');
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig);
connection.connect();


router.get('/', function(req, res, next) {
  res.send("ok");
});

router.post('/', function(req, res, next) {
  res.send("ok");
});


router.post('/sensor', function(req, res) {
  jsondata = JSON.stringify(req.body);
  jsondata = jsondata.replace(/\\/g, "");
  jsondata = jsondata.slice(2, -5);
  jsondata = JSON.parse(jsondata);
  const {sensor_type, sensor_data} = jsondata;

  nowdate = new Date();
  year = nowdate.getFullYear().toString().padStart(4, '0');
  month = (nowdate.getMonth()+1).toString().padStart(2, '0');
  day = nowdate.getDate().toString().padStart(2, '0');
  hours = nowdate.getHours().toString().padStart(2, '0');
  minutes = nowdate.getMinutes().toString().padStart(2, '0');
  date_str = year + "-" + month + "-" + day + " " + hours;
  filename = sensor_type + "_" + nowdate;
  dir = "./sensordata/" + sensor_type + "/";

  fs.existsSync(dir) && fs.mkdir(dir, {recursive: true}, err => {});
  fs.writeFileSync(dir + filename + ".json", JSON.stringify(jsondata));

  res.send("ok");
});


module.exports = router;

