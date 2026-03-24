# 🚙 Rivian Sensor Data Explorer

A full-stack data visualization tool for searching, filtering, and exploring vehicle sensor data — inspired by the data pipelines used in Rivian's Autonomy engineering team.

## 🎯 What It Does

Engineers at Rivian process petabytes of sensor data from test vehicles to validate autonomous driving systems. This project is a working prototype of the kind of internal tooling that enables that workflow:

- **Browse** driving sessions and their metadata
- **Visualize** speed, battery, and motor temperature over time with interactive charts
- **Search & filter** data by route type, speed range, and battery level
- **Export** session data as a downloadable CSV

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend API | Python + FastAPI | Fast to build, production-ready, auto-generates docs |
| Data Processing | pandas | Industry standard for tabular data pipelines |
| Frontend | React + JavaScript | Component-based, reactive UI |
| Charts | Recharts | React-native, responsive charting library |

## 📐 Architecture
Browser (React App)
│
│  HTTP REST calls
▼
FastAPI Backend (Python)          ← localhost:8000
├── GET /api/sessions           — list all driving sessions
├── GET /api/session/{id}       — get session data + stats
├── GET /api/search             — filter by speed/route/battery
├── GET /api/stats              — overall summary statistics
└── GET /api/export/{id}        — download session as CSV
│
│  pandas reads + processes
▼
sensor_data.csv                   — 1,500 simulated sensor readings

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
pip install fastapi uvicorn pandas python-multipart
python generate_data.py        # generates sensor_data.csv
uvicorn main:app --reload      # starts API at http://localhost:8000
```

Visit `http://localhost:8000/docs` for interactive API documentation.

### Frontend
```bash
cd frontend/sensor-explorer
npm install
npm start                      # starts app at http://localhost:3000
```
## 📸 Screenshots

> Dashboard showing session stats and live charts

![Screenshot 2026-03-24 005137](https://github.com/user-attachments/assets/8a4b4789-18de-46f5-947c-b5eeaee8a468)
![Screenshot 2026-03-24 005207](https://github.com/user-attachments/assets/7c8a7f33-5b79-48b6-afa9-a9e58f32c72c)

## 🔌 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Overall statistics across all sessions |
| `/api/sessions` | GET | List of all driving sessions |
| `/api/session/{id}` | GET | Sensor data + stats for one session |
| `/api/search` | GET | Filter by route_type, min/max speed, min battery |
| `/api/export/{id}` | GET | Download session data as CSV |

## 💡 If I Had More Time

- Replace CSV with a cloud database (BigQuery or PostgreSQL)
- Add a GPS map view using latitude/longitude coordinates
- Add WebSocket support for real-time streaming sensor data
- Add authentication with JWT tokens
- Containerize with Docker for easy deployment
- Write unit tests for each API endpoint

## 👤 Author

**Revanth Pattela** — [pattelarevanth@gmail.com](mailto:pattelarevanth@gmail.com)
