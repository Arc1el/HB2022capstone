#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoBLE.h>
#include <ArduinoJson.h>

char ssid[] = "DfXLabPros_2.4G";
char pass[] = "thdtnrms1!";
int keyIndex = 0;
int status = WL_IDLE_STATUS;
char server[] = "192.168.45.83";

WiFiClient client;
String sensor_type;
int sensor_data;

void setup() {
  Serial.begin(9600);

  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);

    delay(5000);
  }
  Serial.println("Connected to wifi");
  printWifiStatus();

  sensor_type = "SENSOR_TYPE";
  sensor_data = 30;
}

void loop() {
  String jsondata = "";
  
  //StaticJsonBuffer<200> jsonBuffer;
  /*
  json["sensor_type"] = "ecg";
  json["sensor_data"] = sensor_data;
  json.printTo(jsondata);
  */
  //JsonObject& root = jsonBuffer.createObject();

  const size_t capacity = JSON_OBJECT_SIZE(1) + 3*JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonBuffer(capacity);
  
  JsonObject& root = jsonBuffer.createObject();
  
  JsonObject& SENSOR = root.createNestedObject("SENSOR");
  
  JsonObject& SENSOR_SENSOR01 = SENSOR.createNestedObject("SENSOR01");
  SENSOR_SENSOR01["type"] = "ecg";
  SENSOR_SENSOR01["data"] = 123;
  
  JsonObject& SENSOR_SENSOR02 = SENSOR.createNestedObject("SENSOR02");
  SENSOR_SENSOR02["type"] = "temp";
  SENSOR_SENSOR02["data"] = 456;

  JsonObject& SENSOR_SENSOR03 = SENSOR.createNestedObject("SENSOR03");
  SENSOR_SENSOR03["type"] = "accel";
  SENSOR_SENSOR03["data"] = 789;
  
  JsonObject& SENSOR_SENSOR04 = SENSOR.createNestedObject("SENSOR04");
  SENSOR_SENSOR04["type"] = "gps";
  SENSOR_SENSOR04["data"] = 042;
  root.printTo(jsondata);
  
  
  Serial.println("\nStarting connection to server...");
  if (client.connect(server, 80)) {
    Serial.println("connected to server");
    client.println("POST /sensor HTTP/1.1");
    client.println("Host: http://192.168.45.25");
    client.println("Content-Type: application/x-www-form-urlencoded");
    client.print("Content-Length: ");
    client.println(jsondata.length());
    client.println();
    client.print(jsondata);
    client.println();

    Serial.println("[Sended Data]");
    Serial.println(jsondata);
  }
  
  while (client.available()) {
    char c = client.read();
    Serial.write(c);
  }

  if (!client.connected()) {
    Serial.println();
    Serial.println("disconnecting from server.");
    client.stop();
  }
  delay(10000);
}


void printWifiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
