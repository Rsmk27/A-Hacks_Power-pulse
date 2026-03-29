# Power Pulse

Built for A-Hacks 2026.

[![Hackathon](https://img.shields.io/badge/Hackathon-A--Hacks%202026-blue)](https://authacks.com/)

## Project Overview
Power Pulse is a firefighter safety monitoring system with:
- ESP32-based field unit for live sensor telemetry.
- Web dashboard for real-time monitoring and alerts.
- Firebase Realtime Database as the live telemetry backbone.
- Companion mobile app stack defined with React Native + Expo SDK 55.

Core safety signals:
- Body environment: temperature and humidity.
- Air quality risk: MQ-2 gas concentration.
- Motion and fall detection from MPU6050.
- GPS location tracking with live coordinates.
- Emergency/SOS state with audible buzzer patterns.

## Hardware Used
- ESP32 development board.
- MPU6050 IMU (accelerometer + gyroscope).
- DHT11 temperature/humidity sensor.
- MQ-2 gas sensor.
- GPS module (UART based, e.g., NEO-6M class).
- SOS push button.
- Active buzzer.
- Power source and wiring harness.

## Protocols Used
- I2C: MPU6050 communication.
- Single-wire digital protocol: DHT11 data line.
- Analog ADC: MQ-2 gas sensor input.
- UART: GPS module serial communication.
- Wi-Fi (802.11): ESP32 connectivity.
- HTTPS (REST): ESP32 to Firebase Realtime Database writes.
- NTP: clock synchronization for reliable Unix timestamps.

## Libraries and SDKs
### Firmware (ESP32)
- Wire.h
- DHT.h
- WiFi.h
- HTTPClient.h
- WiFiClientSecure.h
- time.h
- TinyGPS++.h

### Website (Dashboard)
- React 19
- Vite 8
- Tailwind CSS 3
- Firebase JS SDK 12
- Recharts 3
- MapLibre GL 5
- React Hot Toast
- Leaflet / React Leaflet (available in dependencies)

## Software Used
### Website
- Framework: React + Vite
- Styling: Tailwind CSS + PostCSS + Autoprefixer
- Realtime data: Firebase Realtime Database
- Charts: Recharts
- Mapping: MapLibre GL
- Notifications: React Hot Toast

Main website dependencies currently configured:
- firebase
- maplibre-gl
- react
- react-dom
- react-hot-toast
- recharts
- leaflet
- react-leaflet

### Mobile App
- Framework: React Native
- Runtime/Tooling: Expo
- SDK: Expo SDK 55
- APK Download: [Download FFSD App](https://github.com/ramunarlapati-13/FFSD/releases/download/FFSD/ffsd.apk)

## Repository Structure
- esp32-firmware/: Embedded firmware for the firefighter unit.
- firefighter-dashboard/: React web dashboard.
- gallery/: Dashboard screenshots.

## Local Setup
### Dashboard
1. Open terminal in firefighter-dashboard.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Build production bundle:
   ```bash
   npm run build
   ```

### Firmware
1. Open esp32-firmware/FirefighterSafety_Final.ino in Arduino IDE.
2. Install required libraries (DHT sensor library and TinyGPS++).
3. Set Wi-Fi and Firebase credentials in the sketch.
4. Set device node ID:
   - Change FIREFIGHTER_ID to the unit-specific path (for example firefighter_01).
5. Flash firmware to ESP32.

## Dashboard Gallery
### Live Monitoring View
![Live Monitoring View](gallery/Screenshot%202026-03-28%20184318.png)

### Warning State View
![Warning State View](gallery/Screenshot%202026-03-28%20184350.png)

### Emergency / Fall Alert View
![Emergency Fall Alert View](gallery/emergency-.png)

## Team
Team Name: Fire Fighter Safety Device

### Hardware
- Sairam - [GitHub](https://github.com/sairamgalam017) | [LinkedIn](https://www.linkedin.com/in/sairam-galam/)
- Santhosh - [GitHub](https://github.com/chintu-boltey) | [LinkedIn](https://www.linkedin.com/in/santhosh-juvvanapudi-07a871373/)

### Software
- R.S.Manikanta - [GitHub](https://github.com/Rsmk27) | [LinkedIn](https://www.linkedin.com/in/srinivasamanikanta/)
- Ramu - [GitHub](https://github.com/ramunarlapati-13) | [LinkedIn](https://www.linkedin.com/in/ramunarlapati/)

---
Created for the A-Hacks 2026 Hackathon.

## Team Name
Power Pulse

## Team Members
1. R Srinivasa Manikanta
2. N Ramu
3. G Sairam
4. J Santhosh

## Acknowledgements
Thanks to Aliet Techpreneur Club for conducting events like A-Hacks.
Thanks to ALIET college management.
