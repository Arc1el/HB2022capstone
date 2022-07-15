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
  //(parse) arduino Json -> node.js Json
  jsondata = JSON.stringify(req.body);
  jsondata = jsondata.replace(/\\/g, "");
  jsondata = jsondata.slice(2, -5);
  jsondata = JSON.parse(jsondata);
  const {sensor_type, sensor_data} = jsondata;

  //set date_string
  date_string = get_date_string();

  //set file name. ex) ECG_DATA_2022-07-25_09:59:26:123
  filename = sensor_type + "_" + date_string;

  //set directory path for saving json data
  dir = "./sensordata/" + sensor_type + "/";
  
  //if directory not exist
  try{
    fs.mkdir(dir, {recursive: true}, err => {});
  }catch (e){
    throw e;
  }
  
  //Saving json data in path and Log to dastabase server
  try{
    fs.writeFileSync(dir + filename + ".json", JSON.stringify(jsondata));

    sql = "insert into sensor(sensor_type, date, filename)values('";
    sql += sensor_type + "','" + date_string + "','" + filename + "')";
    send_query(sql);
  }catch (e){
  }

  res.send("ok");
});

//Sending the query function
function send_query(sql){
  try{
    connection.query(sql, (error, rows, fields) => {
      if (error) {
        console.log(error);
      }
      else{

      } 
    });
  }catch (e){
    console.log("Can't save the Sensor data");
  }
};

//Making date string function
function get_date_string(){
  data = new Date();
  year = data.getFullYear();
  month = (data.getMonth() + 1).toString().padStart(2, "0");
  date = data.getDate();
  hours = data.getHours();
  minutes = data.getMinutes();
  seconds = data.getSeconds().toString().padStart(2, '0');
  millis = data.getMilliseconds();

  date_string = year + "-" + month + "-" + date + "_" 
  + hours + ":" + minutes + ":" + seconds + ":" + millis;

  return date_string;
}

module.exports = router;

