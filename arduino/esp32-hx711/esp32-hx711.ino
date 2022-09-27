#include <Arduino.h>
#include "soc/rtc.h"
#include "HX711.h"

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;
bool TARE_FLAG = false;

long hx711_data;
long read_data;
int counter;


HX711 scale;

void setup() {
  Serial.begin(115200);
  rtc_clk_cpu_freq_set(RTC_CPU_FREQ_80M);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  hx711_data = 0;
  read_data = 0;
  counter = 0;
}

void loop() {
  if (scale.is_ready()) {
    read_data = scale.read(); // 20000
    Serial.print(hx711_data);
    Serial.print("   /   ");
    Serial.println(counter);
    
    if(hx711_data > read_data + 100000) {
      if((hx711_data > 0) && (read_data < 0)) {
        counter += 1;
      }
      hx711_data = read_data;
    }
    else if(hx711_data + 100000 < read_data){
      hx711_data = read_data;
    }  
  }
}
