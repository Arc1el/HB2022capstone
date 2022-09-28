#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <HttpClient.h>
#include "soc/rtc.h"
#include "HX711.h"
#include <Adafruit_MLX90614.h>
#include <HardwareSerial.h>

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

//rfid wiring
HardwareSerial rfid(2);
String rfid_data;

//Period Setting, unit : second
#define TEMPERATURE_PERIOD 3
#define BREATH_PERIOD 0.1
#define SEND_JSON_PERIOD 5

void hx711(void *param){
  while(1){
    if (scale.is_ready()) {
      hx711_now_data = scale.read(); // 20000
      if(hx711_now_data < 0){
        hx711_now_data = hx711_now_data * -1;
      }
      Serial.print(hx711_prev_data);
      Serial.print("   /   ");
      Serial.print(hx711_counter);
      Serial.print("   /   ");
      Serial.println(hx711_now_status);
      if(hx711_prev_data > hx711_now_data + 100000) {
        hx711_now_status = "constraction";
        if(hx711_prev_status == "expansion" && hx711_now_status == "constraction"){
          hx711_counter += 1;
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
    Serial.print("temperature = "); Serial.print(mlx.readObjectTempC()); Serial.println("*C");\
    delay(TEMPERATURE_PERIOD * 10000);
  }
}
void rfid_func(void *param){
  while(1){
    if(rfid.available() > 0){
      rfid_data = rfid.readStringUntil('\n'); //추가 시리얼의 값을 수신하여 String으로 저장
      Serial.print("RFID reading value : ");
      Serial.println(rfid_data); //기본 시리얼에 추가 시리얼 내용을 출력
    }
  }
}
void post_func(void *param){
  while(1){
    Serial.println("===== Sending JSON data to Server =====");
    delay(SEND_JSON_PERIOD * 1000);

    hx711_counter = 0;
  }
}

void setup() {
  Serial.begin(115200);

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
  xTaskCreatePinnedToCore ( hx711,"hx711", 10000, NULL, 0, &hx711_handler, CORE1 );
  xTaskCreatePinnedToCore ( gy906,"gy906", 10000, NULL, 0, &gy906_handler, CORE2 );
  xTaskCreatePinnedToCore ( rfid_func,"rfid", 10000, NULL, 0, &rfid_handler, CORE1 );

  //send the data using multi-thread
  xTaskCreatePinnedToCore ( post_func,"post_func", 10000, NULL, 0, &post_handler, CORE2 );


  
}

void loop() {
  //don't use loop block
  sleep(99999999999999999999999999);
}
