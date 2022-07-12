#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoBLE.h>
#include <ArduinoJson.h>

char ssid[] = "DfXLabPros_2.4G";
char pass[] = "thdtnrms1!";
int keyIndex = 0;
int status = WL_IDLE_STATUS;
char server[] = "192.168.45.25";

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
  filename = "test_data";
}

void loop() {
  String postData = "test";
  
  String jsondata = "";
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& json = jsonBuffer.createObject();

  json["sensor_type"] = sensor_type;
  json["sensor_data"] = sensor_data;
  json.printTo(jsondata);

  
  Serial.println("\nStarting connection to server...");
  if (client.connect(server, 80)) {
    Serial.println("connected to server");
    client.println("POST /sensor HTTP/1.1");
    client.println("Host: http://192.168.45.25");
    client.println("Content-Type: application/x-www-form-urlencoded");
    client.print("Content-Length: ");
    client.println(json.length());
    client.println();
    client.print(json);
    client.println();

    Serial.println("[Sended Data]");
    Serial.println(json);
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
  delay(5000);
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
