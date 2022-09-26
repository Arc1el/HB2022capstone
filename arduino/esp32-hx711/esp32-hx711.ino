#include <Arduino.h>
#include "soc/rtc.h"
#include "HX711.h"

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;
bool TARE_FLAG = false;

HX711 scale;

void setup() {
  Serial.begin(115200);
  rtc_clk_cpu_freq_set(RTC_CPU_FREQ_80M);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

}

void loop() {

  if (scale.is_ready() && TARE_FLAG == false) {
    scale.set_scale();    
    Serial.println("Tare... remove any weights from the scale.");
    delay(3000);
    scale.tare();
    Serial.println("Tare done...");
    TARE_FLAG = true;
  }
  
  if (scale.is_ready() && TARE_FLAG == true) {
    long reading = scale.read();
    Serial.print("Result: ");
    Serial.println(reading);
  } 
  else {
    Serial.println("HX711 not found.");
  }
  delay(300);
}
