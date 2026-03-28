#include <Wire.h>
#include <math.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <time.h>

// ================= WIFI + FIREBASE (REST) =================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

String firebaseHost = "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com";
String firebaseAuth = "YOUR_FIREBASE_DB_SECRET_OR_LEAVE_EMPTY";

// ================= DEFINITIONS =================
#define MPU_ADDR           0x68
#define MPU_PWR_MGMT_1     0x6B
#define MPU_ACCEL_XOUT_H   0x3B
#define MPU_GYRO_XOUT_H    0x43

#define DHTPIN             4
#define DHTTYPE            DHT11
#define MQ2_PIN            34

#define SOS_BUTTON         14
#define SOS_BUTTON_GND     27
#define BUZZER             13

#define FIREBASE_NODE      "firefighter_01"

// ================= MOCK GPS (fixed as requested) =================
const double MOCK_LAT = 16.508981286911585;
const double MOCK_LNG = 80.65806564630255;

// ================= MOVEMENT THRESHOLDS =================
#define WARN_SECONDS       10
#define EMERGENCY_SECONDS  30
#define MOVE_THRESHOLD_G   0.13f

// ================= GAS THRESHOLDS (MQ-2 approx ppm) =================
#define GAS_WARN_PPM       320.0f
#define GAS_CRIT_PPM       450.0f

// ================= TEMPERATURE THRESHOLDS =================
#define TEMP_WARN_C        47.0f
#define TEMP_CRIT_C        55.0f

// ================= BUZZER TIMING =================
#define AMBIENT_BEEP_INTERVAL_MS  60000UL
#define AMBIENT_BEEP_ON_MS          100UL

#define WARNING_BEEP_ON_MS          200UL
#define WARNING_BEEP_OFF_MS        1200UL
#define EMERGENCY_BEEP_ON_MS        200UL
#define EMERGENCY_BEEP_OFF_MS       200UL

// ================= OBJECTS =================
DHT dht(DHTPIN, DHTTYPE);

// ================= MPU RAW / FILTER STATE =================
int16_t rawAx = 0, rawAy = 0, rawAz = 0;
int16_t rawGx = 0, rawGy = 0, rawGz = 0;

float accelBiasX = 0.0f, accelBiasY = 0.0f, accelBiasZ = 0.0f;
float gyroBiasX = 0.0f, gyroBiasY = 0.0f, gyroBiasZ = 0.0f;

float Ax = 0.0f, Ay = 0.0f, Az = 0.0f;
float Gx = 0.0f, Gy = 0.0f;
float totalAcc = 0.0f;
float angleX = 0.0f, angleY = 0.0f;
unsigned long lastMpuMicros = 0;

// ================= MOVEMENT TRACKING =================
unsigned long noMoveStartTime = 0;
bool notMoving = false;
String movementStatus = "MOVING";

// ================= STATUS FLAGS =================
String deviceState = "STARTUP";
String mpuStatus = "OK";
String dhtStatus = "OK";
String gpsStatus = "MOCK";
String systemStatus = "OK";

// ================= SOS TOGGLE STATE =================
bool sosActive = false;
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_MS = 200;

// ================= BUZZER STATE MACHINE =================
unsigned long buzzerTimer = 0;
bool buzzerOn = false;

unsigned long lastAmbientBurstTime = 0;
int ambientBeepCount = 0;
int ambientBeepsTarget = 0;
bool ambientBeepInBurst = false;
unsigned long ambientBeepTimer = 0;
bool ambientBeepPhase = false; // false=ON, true=OFF gap

unsigned long lastSendMs = 0;
const unsigned long SEND_INTERVAL_MS = 2000;

bool mpuImpactEvent = false;

// ================= HELPERS =================
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println(" connected");
}

void initTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = time(nullptr);
  int retries = 0;
  while (now < 100000 && retries < 30) {
    delay(500);
    now = time(nullptr);
    retries++;
  }
}

unsigned long currentUnixTime() {
  time_t now = time(nullptr);
  if (now > 100000) return (unsigned long)now;
  return millis() / 1000UL;
}

float mq2RawToApproxPpm(int rawAdc) {
  return ((float)rawAdc / 4095.0f) * 1000.0f;
}

String dashboardStatusFromState(float temperature, float gasPpm, bool fallDetected) {
  if (fallDetected || temperature >= TEMP_CRIT_C || gasPpm >= GAS_CRIT_PPM || deviceState == "EMERGENCY" || deviceState == "SOS") {
    return "critical";
  }
  if (temperature >= TEMP_WARN_C || gasPpm >= GAS_WARN_PPM || deviceState == "WARNING") {
    return "warning";
  }
  return "safe";
}

void initMPU() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(MPU_PWR_MGMT_1);
  Wire.write(0x00);
  Wire.endTransmission(true);
  delay(100);
}

bool readMPURaw(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(MPU_ACCEL_XOUT_H);
  if (Wire.endTransmission(false) != 0) {
    return false;
  }

  const uint8_t needed = 14;
  if (Wire.requestFrom((int)MPU_ADDR, (int)needed, (int)true) != needed) {
    return false;
  }

  ax = (Wire.read() << 8) | Wire.read();
  ay = (Wire.read() << 8) | Wire.read();
  az = (Wire.read() << 8) | Wire.read();
  Wire.read();
  Wire.read();
  gx = (Wire.read() << 8) | Wire.read();
  gy = (Wire.read() << 8) | Wire.read();
  gz = (Wire.read() << 8) | Wire.read();
  return true;
}

void calibrateMPU(int samples = 500) {
  long sumAx = 0, sumAy = 0, sumAz = 0;
  long sumGx = 0, sumGy = 0, sumGz = 0;

  Serial.print("Calibrating MPU6050");
  for (int i = 0; i < samples; i++) {
    int16_t ax, ay, az, gx, gy, gz;
    if (readMPURaw(ax, ay, az, gx, gy, gz)) {
      sumAx += ax;
      sumAy += ay;
      sumAz += az;
      sumGx += gx;
      sumGy += gy;
      sumGz += gz;
    }
    if (i % 80 == 0) Serial.print(".");
    delay(3);
  }
  Serial.println();

  accelBiasX = (float)sumAx / samples;
  accelBiasY = (float)sumAy / samples;
  accelBiasZ = ((float)sumAz / samples) - 16384.0f;
  gyroBiasX = (float)sumGx / samples;
  gyroBiasY = (float)sumGy / samples;
  gyroBiasZ = (float)sumGz / samples;
}

bool updateMPUAndMotion() {
  if (!readMPURaw(rawAx, rawAy, rawAz, rawGx, rawGy, rawGz)) {
    mpuStatus = "ERROR";
    systemStatus = "SENSOR_FAILURE";
    return false;
  }

  Ax = (rawAx - accelBiasX) / 16384.0f;
  Ay = (rawAy - accelBiasY) / 16384.0f;
  Az = (rawAz - accelBiasZ) / 16384.0f;
  Gx = (rawGx - gyroBiasX) / 131.0f;
  Gy = (rawGy - gyroBiasY) / 131.0f;

  totalAcc = sqrtf((Ax * Ax) + (Ay * Ay) + (Az * Az));

  unsigned long nowUs = micros();
  float dt = (lastMpuMicros == 0) ? 0.01f : ((nowUs - lastMpuMicros) / 1000000.0f);
  lastMpuMicros = nowUs;

  float accAngleX = atan2f(Ay, sqrtf((Ax * Ax) + (Az * Az))) * 57.2958f;
  float accAngleY = atan2f(-Ax, sqrtf((Ay * Ay) + (Az * Az))) * 57.2958f;
  const float alpha = 0.96f;
  angleX = alpha * (angleX + Gx * dt) + (1.0f - alpha) * accAngleX;
  angleY = alpha * (angleY + Gy * dt) + (1.0f - alpha) * accAngleY;

  float movementDelta = fabsf(totalAcc - 1.0f);
  mpuImpactEvent = (movementDelta > 1.4f) || (fabsf(angleX) > 60.0f) || (fabsf(angleY) > 60.0f);

  if (movementDelta < MOVE_THRESHOLD_G) {
    if (!notMoving) {
      noMoveStartTime = millis();
      notMoving = true;
    }
  } else {
    notMoving = false;
  }

  unsigned long noMoveDuration = notMoving ? ((millis() - noMoveStartTime) / 1000UL) : 0UL;
  if (!notMoving) {
    movementStatus = "MOVING";
  } else if (noMoveDuration >= EMERGENCY_SECONDS) {
    movementStatus = "NOT MOVING LONG TIME (" + String(noMoveDuration) + " sec)";
    deviceState = "EMERGENCY";
  } else if (noMoveDuration >= WARN_SECONDS) {
    movementStatus = "NOT MOVING (" + String(noMoveDuration) + " sec)";
    deviceState = "WARNING";
  }

  mpuStatus = "OK";
  return true;
}

void updateSosToggle() {
  bool currentButtonState = digitalRead(SOS_BUTTON);
  if (currentButtonState == LOW && lastButtonState == HIGH) {
    unsigned long now = millis();
    if (now - lastDebounceTime >= DEBOUNCE_MS) {
      lastDebounceTime = now;
      sosActive = !sosActive;
      Serial.println(sosActive ? ">>> SOS ACTIVATED <<<" : ">>> SOS DEACTIVATED <<<");
    }
  }
  lastButtonState = currentButtonState;
}

void handleBuzzer(float temperature) {
  unsigned long now = millis();

  if (deviceState == "SOS") {
    digitalWrite(BUZZER, HIGH);
    buzzerOn = true;
    ambientBeepInBurst = false;
    ambientBeepCount = 0;
    lastAmbientBurstTime = now;
    return;
  }

  if (deviceState == "EMERGENCY") {
    ambientBeepInBurst = false;
    ambientBeepCount = 0;
    unsigned long interval = buzzerOn ? EMERGENCY_BEEP_ON_MS : EMERGENCY_BEEP_OFF_MS;
    if (now - buzzerTimer >= interval) {
      buzzerOn = !buzzerOn;
      buzzerTimer = now;
      digitalWrite(BUZZER, buzzerOn ? HIGH : LOW);
    }
    return;
  }

  if (deviceState == "WARNING") {
    ambientBeepInBurst = false;
    ambientBeepCount = 0;
    unsigned long interval = buzzerOn ? WARNING_BEEP_ON_MS : WARNING_BEEP_OFF_MS;
    if (now - buzzerTimer >= interval) {
      buzzerOn = !buzzerOn;
      buzzerTimer = now;
      digitalWrite(BUZZER, buzzerOn ? HIGH : LOW);
    }
    return;
  }

  int targetBeeps = 0;
  if (temperature >= 25.0f && temperature < 30.0f) targetBeeps = 1;
  else if (temperature >= 30.0f && temperature < 35.0f) targetBeeps = 2;
  else if (temperature >= 35.0f && temperature <= 40.0f) targetBeeps = 3;

  if (targetBeeps == 0) {
    digitalWrite(BUZZER, LOW);
    buzzerOn = false;
    ambientBeepInBurst = false;
    ambientBeepCount = 0;
    lastAmbientBurstTime = now;
    return;
  }

  if (!ambientBeepInBurst) {
    if (now - lastAmbientBurstTime >= AMBIENT_BEEP_INTERVAL_MS) {
      ambientBeepInBurst = true;
      ambientBeepsTarget = targetBeeps;
      ambientBeepCount = 0;
      ambientBeepPhase = false;
      ambientBeepTimer = now;
      digitalWrite(BUZZER, HIGH);
      buzzerOn = true;
    } else {
      digitalWrite(BUZZER, LOW);
      buzzerOn = false;
    }
    return;
  }

  if (!ambientBeepPhase) {
    if (now - ambientBeepTimer >= AMBIENT_BEEP_ON_MS) {
      digitalWrite(BUZZER, LOW);
      buzzerOn = false;
      ambientBeepPhase = true;
      ambientBeepTimer = now;
      ambientBeepCount++;
      if (ambientBeepCount >= ambientBeepsTarget) {
        ambientBeepInBurst = false;
        lastAmbientBurstTime = now;
      }
    }
  } else {
    if (now - ambientBeepTimer >= AMBIENT_BEEP_ON_MS) {
      digitalWrite(BUZZER, HIGH);
      buzzerOn = true;
      ambientBeepPhase = false;
      ambientBeepTimer = now;
    }
  }
}

void sendToFirebase(float temperature, float humidity, float gasPpm, bool fallDetected, double latitude, double longitude) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient https;
  String url = firebaseHost + "/" FIREBASE_NODE ".json";
  if (firebaseAuth.length() > 0) {
    url += "?auth=" + firebaseAuth;
  }

  if (!https.begin(client, url)) {
    Serial.println("HTTPS begin failed");
    return;
  }

  https.addHeader("Content-Type", "application/json");

  String dashboardStatus = dashboardStatusFromState(temperature, gasPpm, fallDetected);

  String json = "{";
  json += "\"temperature\":" + String(temperature, 1) + ",";
  json += "\"humidity\":" + String(humidity, 1) + ",";
  json += "\"gas_ppm\":" + String(gasPpm, 1) + ",";
  json += "\"fall_detected\":" + String(fallDetected ? "true" : "false") + ",";
  json += "\"status\":\"" + dashboardStatus + "\",";
  json += "\"last_updated\":" + String(currentUnixTime()) + ",";
  json += "\"gps\":{\"lat\":" + String(latitude, 6) + ",\"lng\":" + String(longitude, 6) + "},";

  // Legacy/diagnostic keys retained from old code to keep compatibility.
  json += "\"total_acc\":" + String(totalAcc, 3) + ",";
  json += "\"movement\":\"" + movementStatus + "\",";
  json += "\"device_state\":\"" + deviceState + "\",";
  json += "\"mpu_status\":\"" + mpuStatus + "\",";
  json += "\"dht_status\":\"" + dhtStatus + "\",";
  json += "\"gps_status\":\"" + gpsStatus + "\",";
  json += "\"system_status\":\"" + systemStatus + "\",";
  json += "\"sos_active\":" + String(sosActive ? "true" : "false") + ",";
  json += "\"mq2_raw\":" + String(analogRead(MQ2_PIN));
  json += "}";

  int httpCode = https.PUT(json);
  Serial.print("Firebase PUT code: ");
  Serial.println(httpCode);
  https.end();
}

void setup() {
  Serial.begin(115200);
  delay(300);

  connectWiFi();
  initTime();

  Wire.begin(21, 22);
  Wire.setClock(100000);
  initMPU();
  calibrateMPU();

  dht.begin();

  pinMode(SOS_BUTTON_GND, OUTPUT);
  digitalWrite(SOS_BUTTON_GND, LOW);
  pinMode(SOS_BUTTON, INPUT_PULLUP);

  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW);

  pinMode(MQ2_PIN, INPUT);

  lastAmbientBurstTime = millis();
  Serial.println("Firefighter safety firmware started");
}

void loop() {
  systemStatus = "OK";
  deviceState = "NORMAL";
  gpsStatus = "MOCK";

  updateSosToggle();
  updateMPUAndMotion();

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    dhtStatus = "ERROR";
    systemStatus = "SENSOR_FAILURE";
    if (isnan(temperature)) temperature = 0.0f;
    if (isnan(humidity)) humidity = 0.0f;
  } else {
    dhtStatus = "OK";
  }

  int mq2Raw = analogRead(MQ2_PIN);
  float gasPpm = mq2RawToApproxPpm(mq2Raw);

  if (temperature >= TEMP_WARN_C || gasPpm >= GAS_WARN_PPM) {
    if (deviceState == "NORMAL") deviceState = "WARNING";
  }
  if (temperature >= TEMP_CRIT_C || gasPpm >= GAS_CRIT_PPM) {
    deviceState = "EMERGENCY";
  }

  bool noMoveEmergency = false;
  if (notMoving) {
    unsigned long noMoveDuration = (millis() - noMoveStartTime) / 1000UL;
    noMoveEmergency = noMoveDuration >= EMERGENCY_SECONDS;
  }

  bool fallDetected = mpuImpactEvent || noMoveEmergency;

  if (sosActive) {
    deviceState = "SOS";
  }

  handleBuzzer(temperature);

  if (millis() - lastSendMs >= SEND_INTERVAL_MS) {
    lastSendMs = millis();

    sendToFirebase(
      temperature,
      humidity,
      gasPpm,
      fallDetected,
      MOCK_LAT,
      MOCK_LNG
    );

    Serial.println("\n==== FIREFIGHTER REPORT ====");
    Serial.print("State: "); Serial.println(deviceState);
    Serial.print("Dashboard Status: "); Serial.println(dashboardStatusFromState(temperature, gasPpm, fallDetected));
    Serial.print("Movement: "); Serial.println(movementStatus);
    Serial.print("Total Acc: "); Serial.println(totalAcc, 3);
    Serial.print("Tilt X/Y: "); Serial.print(angleX, 1); Serial.print(" / "); Serial.println(angleY, 1);
    Serial.print("Temperature: "); Serial.println(temperature, 1);
    Serial.print("Humidity: "); Serial.println(humidity, 1);
    Serial.print("Gas PPM: "); Serial.println(gasPpm, 1);
    Serial.print("Fall Detected: "); Serial.println(fallDetected ? "YES" : "NO");
    Serial.print("GPS Lat/Lng: "); Serial.print(MOCK_LAT, 6); Serial.print(" / "); Serial.println(MOCK_LNG, 6);
    Serial.print("SOS Active: "); Serial.println(sosActive ? "YES" : "NO");
    Serial.println("============================");
  }
}
