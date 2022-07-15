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
  console.log(jsondata);
  jsondata = JSON.parse(jsondata);
  
  //Saving json data in path and Log to dastabase server
  try{
    save_sensor_data(jsondata);
  }catch (e){
    console.log("cant't save data. error : ", e);
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

function save_sensor_data(data){
  sensor01 = data.SENSOR.SENSOR01;
  sensor02 = data.SENSOR.SENSOR02;
  sensor03 = data.SENSOR.SENSOR03;
  sensor04 = data.SENSOR.SENSOR04;
  senarr = [sensor01, sensor02, sensor03, sensor04];
  console.log("senarr = ", senarr);

  for (sen in senarr){
    type = senarr[sen].type;
    data = senarr[sen].data;
    try{
      //set date_string
      date_string = get_date_string();
      //set file name. ex) ECG_DATA_2022-07-25_09:59:26:123
      filename = type + "_" + date_string;
      //set directory path for saving json data
      dir = "./sensordata/" + type + "/";

      try{
        fs.mkdir(dir, {recursive: true}, err => {});
      }catch (e){
        throw e;
      }
      fs.writeFileSync(dir + filename + ".json", JSON.stringify(senarr[sen]));

      sql = "insert into sensor(sensor_type, date, filename)values('";
      sql += type + "','" + date_string + "','" + filename + ".json')";
      send_query(sql);
    }catch (e){
      console.log(e);
    }
  }
}

module.exports = router;

