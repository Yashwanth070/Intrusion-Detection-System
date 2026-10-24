# Lightweight Machine Learning Intrusion Detection for IoT/IIoT Networks
### Real-Time Microcontroller Deployment & Telemetry Dashboard

[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend%20Live-black?logo=vercel&logoColor=white)](https://intrusion-detection-systems.vercel.app)
[![Render](https://img.shields.io/badge/Render-Backend%20Live-46E3B7?logo=render&logoColor=white)](https://intrusion-detection-backend-1jrs.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.0-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5.1-FF6384?logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

> 🚀 **Live Frontend (Vercel)**: [https://intrusion-detection-systems.vercel.app](https://intrusion-detection-systems.vercel.app)  
> ⚡ **Live Backend API (Render)**: [https://intrusion-detection-backend-1jrs.onrender.com](https://intrusion-detection-backend-1jrs.onrender.com) (`/api/health`)

---

## 📌 Project Overview

This project is a real-time, professional web dashboard based on the research paper:
> **"Lightweight Machine Learning Intrusion Detection for IoT/IIoT Networks: Quantisation Strategies and Physical Deployment on Resource-Constrained Microcontrollers"**  
> *Emanuele Pio De Bernardis, Oleksandr Kuznetsov, Marco Arnesano, Polatova Zhansaya, Madina Sydykova (Electronics, MDPI)*

The paper investigates the gap between theoretical ML intrusion detection accuracy and actual real-world physical deployment on resource-constrained microcontrollers. This dashboard simulates and visualizes the complete end-to-end pipeline in real time.

---

## ⚡ Key Highlights from the Research Paper

1. **Dataset**: Benchmarked on the **TON_IoT** network dataset (10 attack classes: *Normal, Backdoor, DDoS, DoS, Injection, MITM, Password, Ransomware, Scanning, XSS*) and tested against **CIC-IoT-2023** for cross-domain distribution shifts.
2. **Models Benchmarked**:
   - Logistic Regression
   - Decision Tree (depth $\le 5$)
   - Random Forest (100 trees)
   - XGBoost
   - **LightGBM** (Top Performer: $F_1 = 0.9993 \pm 0.0001$, Accuracy = $0.9994$)
   - MLP Baseline
3. **Quantisation Strategies**:
   - `m2cgen` (pure C-code generation for zero-runtime inference)
   - TensorFlow Lite Micro INT8 quantisation
   - Custom post-training INT8 binary format for tree ensembles (>18× storage compression)
4. **Physical Hardware Benchmarking**:
   - **Arduino Mega 2560** (8-bit AVR ATmega2560 @ 16 MHz, 8 KB SRAM, 256 KB Flash)
   - **ESP32-C3 SuperMini** (32-bit RISC-V @ 160 MHz, 400 KB SRAM, 4 MB Flash)
   - **Hardware Acceleration**: RISC-V executes the identical compiled IDS model **5.8× to 7.8× faster** than the 8-bit AVR architecture.

---

## 🏗️ Architecture

```
                       ┌─────────────────────────────────────────┐
                       │     React 19 + Vite Dashboard (3000)    │
                       │   (Overview, Alerts, Devices, Analytics)│
                       └───────────▲─────────────────▲───────────┘
                                   │                 │
                           REST API│                 │Socket.IO
                        (HTTP/JSON)│                 │(WebSockets)
                                   │                 │
                       ┌───────────▼─────────────────┴───────────┐
                       │       Express.js Server (Port 5001)     │
                       ├─────────────────────────────────────────┤
                       │  • Real-Time TON_IoT Packet Generator   │
                       │  • Edge Microcontroller Telemetry Engine│
                       │  • In-Memory Ring Buffer (Zero DB Dep)  │
                       └─────────────────────────────────────────┘
```

---

## 🚀 Features

- **Real-Time Threat Feed**: Live packet stream classified by ML models with confidence scores, source/destination IPs, and protocol entropy.
- **Microcontroller Hardware Telemetry**: Live CPU, SRAM, Flash, and inference latency gauges for both Arduino Mega 2560 and ESP32-C3.
- **ML Performance Matrix**: Comprehensive model comparison table, accuracy/F1 grouped bar charts, and memory compression ratios.
- **Deep Threat Intelligence**: Stacked area attack trends, interactive 5×5 LightGBM Confusion Matrix heatmap, and cross-domain generalisation gap cards.
- **Dark / Light Theme Toggle**: Seamless switch on the top right with persistent storage and dynamic Chart.js canvas color adaptation.
- **Zero External Database Requirement**: Built-in in-memory data store (`store.js`) boots immediately out-of-the-box.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Chart.js 4, react-chartjs-2, react-icons (Heroicons v2), Custom Glassmorphic CSS3
- **Backend**: Node.js, Express 4, Socket.IO, CORS, dotenv
- **Data Engine**: Custom in-memory store with bounded collections and aggregation pipelines

--
