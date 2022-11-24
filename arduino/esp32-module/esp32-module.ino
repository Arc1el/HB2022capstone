#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <HttpClient.h>
#include "soc/rtc.h"
#include "HX711.h"
#include <Adafruit_MLX90614.h>
#include <HardwareSerial.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <HTTPClient.h>
#include <HttpClient.h>

//define core
#define CORE1 0
#define CORE2 1

//sensor handler
TaskHandle_t hx711_handler;
TaskHandle_t gy906_handler;
TaskHandle_t rfid_handler;

//post handler
TaskHandle_t post_handler;

//hx411 wiring
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;
long hx711_now_data;
long hx711_prev_data;
long hx711_counter;
String hx711_now_status;
String hx711_prev_status;
HX711 scale;

//gy906 wiring
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
float gy906_data;
String gy906_string;
int gy906_counter;

//rfid wiring
HardwareSerial rfid(2);
String rfid_data;

//Period Setting, unit : second
#define TEMPERATURE_PERIOD 1
#define BREATH_PERIOD 0.1
#define SEND_JSON_PERIOD 5

//JSON data Settings
int status_first;
String jsondata = "";
StaticJsonBuffer<300> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();

void hx711(void *param){
  
  while(1){
    if (scale.is_ready()) {
      hx711_now_data = scale.read(); // 20000
      if(hx711_now_data < 0){
        hx711_now_data = hx711_now_data * -1;
      }
      if(hx711_prev_data > hx711_now_data + 100000) {
        hx711_now_status = "constraction";
        if(hx711_prev_status == "expansion" && hx711_now_status == "constraction"){
          hx711_counter += 1;
          Serial.print("Breath Counter : ");
          Serial.println(hx711_counter);
          root["breath"] = hx711_counter;
        }
        hx711_prev_status = hx711_now_status;
        hx711_prev_data = hx711_now_data;
      }
      else if(hx711_prev_data + 100000 < hx711_now_data){
        hx711_now_status = "expansion";
        hx711_prev_status = hx711_now_status;
        hx711_prev_data = hx711_now_data;
      }
    }  
  }
}
void gy906(void *param){
  while(1){
    gy906_data = mlx.readObjectTempC();
    Serial.print("temperature = ");
    Serial.print(gy906_data);
    Serial.println("*C");
    root["temp"] = gy906_data;
    
    gy906_counter += 1;
    delay(TEMPERATURE_PERIOD * 1000);
  }
}
void rfid_func(void *param){
  while(1){
    if(rfid.available() > 0){
      //String reading = rfid.readStringUntil('\n\r');
      String reading = rfid.readString(); //Reading RFID value
      if(reading == " "){
        Serial.println("reading value is empty. rfid is not updated");
      }
      else{
        rfid_data = reading;
        Serial.print("RFID reading value : ");
        Serial.println(rfid_data);
        root["rfid"] = rfid_data;
      }
    }
  }
}
void post_func(void *param){
  while(1){
    if (status_first == 0){
      Serial.println("First Sending... delay for 2ec");
      delay(2000);
    }
    Serial.println("===== Sending JSON data to Server =====");
    root.printTo(jsondata);

    //sending json data
    if(WiFi.status() == WL_CONNECTED){
      Serial.println("json sending start");
      HTTPClient http;   
     
      http.begin("http://httpbin.org/post");              // Specify destination for HTTP request
      http.addHeader("Content-Type",
                     "application/x-www-form-urlencoded");  // Specify content-type header
      
      String httpRequestData = jsondata;
      int httpResponseCode = http.POST(httpRequestData);    // Send the actual POST request
      
      if(httpResponseCode>0){                               // if data sending is sucessful
      
        String response = http.getString();                 // Get the response to the request
        
        Serial.println(httpResponseCode);                   // Print return code
        Serial.println(response);                           // Print request answer
      
      }
      else{
        Serial.print("Error on sending POST: ");
        Serial.println(httpResponseCode);
      }
      http.end();  // free 
      Serial.println("==== Sending the data Successfully ====");
    }
    
    Serial.println(jsondata);
    root["breath"] = 0;
    root["temp"] = "";
    root["rfid"] = rfid_data;
    jsondata = "";
    

    //initalize data
    hx711_counter = 0;
    gy906_counter = 0;

    status_first = 1;
    
    delay(SEND_JSON_PERIOD * 1000);
  }
}

void setup() {

  // wifi provisioning code
  // station mode, esp32 can operate station + ap mode simultaneously
  WiFi.mode(WIFI_STA);
  
  Serial.begin(115200);

  WiFiManager wm;
  //if you wanna reset settings on rebooting device, using this code
  //wm.resetSettings();
  bool res;
  res = wm.autoConnect("Settings"); // password protected ap

  if(!res) {
      Serial.println("connection-failed");
      // ESP.restart();
  }
  // if connection is failed
  else {
      Serial.println("connection-success");
  }

  status_first = 0;

  //hx711 init
  rtc_clk_cpu_freq_set(RTC_CPU_FREQ_80M);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  hx711_prev_data = 0;
  hx711_now_data = 0;
  hx711_counter = 0;
  hx711_now_status = "none";
  hx711_prev_status = "none";
  
  //gy906 init
  if (!mlx.begin()) {
    Serial.println("Error connecting to MLX sensor. Check wiring.");
    while (1);
  };
  
  gy906_counter = 0;
  gy906_string = "";
  /*
  xTaskCreatePinnedToCore (
  Task1Code,      // task function name
  "task1",        // task name
  10000,          // stack size(word)
  NULL,           // task parameter
  0,              // task priority
  &Task1,         // task handler adress
  0 );            // executing core number
  */

  //rfid init
  rfid.begin(9600, SERIAL_8N1, 36, 13);

  //collect the data using multi-thread
  xTaskCreatePinnedToCore ( hx711,"hx711", 10000, NULL, 0, &hx711_handler, CORE2 );
  xTaskCreatePinnedToCore ( gy906,"gy906", 10000, NULL, 0, &gy906_handler, CORE2 );
  xTaskCreatePinnedToCore ( rfid_func,"rfid", 10000, NULL, 0, &rfid_handler, CORE2 );

  //send the data using multi-thread
  xTaskCreatePinnedToCore ( post_func,"post_func", 10000, NULL, 0, &post_handler, CORE2 );

  Serial.println();
  Serial.println("setup complete");

}

void loop() {
  //don't use loop block
  sleep(99999999999999999999999999);
}
