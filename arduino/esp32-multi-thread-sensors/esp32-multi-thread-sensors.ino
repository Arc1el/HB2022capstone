#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <HttpClient.h>
#include "soc/rtc.h"
#include "HX711.h"
#include <Adafruit_MLX90614.h>

//define core
#define CORE1 0
#define CORE2 1

//sensor handler
TaskHandle_t hx711_handler;
TaskHandle_t gy906_handler;
TaskHandle_t em4305_handler;

//post handler
TaskHandle_t post_handler;

//datas
float gy906_data;
long hx711_data;
String rfid_data;

//hx411 wiring
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;
HX711 scale;

Adafruit_MLX90614 mlx = Adafruit_MLX90614();



void hx711(void *param){
  while(1){
    if (scale.is_ready()) {
      long reading = scale.read();
      Serial.print("hx711 data : ");
      Serial.println(reading);
    } 
    else {
      Serial.println("HX711 not found.");
    }
    delay(1000);
  }
}
void gy906(void *param){
  while(1){
    Serial.print("Ambient = "); Serial.print(mlx.readAmbientTempC());
    Serial.print("*C\tObject = "); Serial.print(mlx.readObjectTempC()); Serial.println("*C");\
    Serial.println();
    delay(2000);
  }
}
void rfid(void *param){
  while(1){
    Serial.print("em4305 : ");
    Serial.println(xPortGetCoreID());
    delay(3000);
  }
}
void post_func(void *param){
  while(1){
    Serial.print("hx711_post : ");
    Serial.println(xPortGetCoreID());
    delay(4000);
  }
}

void setup() {
  Serial.begin(115200);

  //hx711 init
  rtc_clk_cpu_freq_set(RTC_CPU_FREQ_80M);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

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
  xTaskCreatePinnedToCore ( hx711,"hx711", 10000, NULL, 0, &hx711_handler, CORE1 );
  xTaskCreatePinnedToCore ( gy906,"gy906", 10000, NULL, 0, &gy906_handler, CORE2 );
  xTaskCreatePinnedToCore ( rfid,"em4305", 10000, NULL, 0, &em4305_handler, CORE1 );

  xTaskCreatePinnedToCore ( post_func,"post_func", 10000, NULL, 0, &post_handler, CORE2 );


  
}

void loop() {
  //don't use loop block
  sleep(99999999999999999999999999);
}
