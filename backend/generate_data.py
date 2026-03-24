import csv
import random
import math
from datetime import datetime, timedelta

# This script creates fake car sensor data
# Imagine a car driving around for 3 sessions

sessions = [
    {"id": "session_001", "start_speed": 0, "route": "highway"},
    {"id": "session_002", "start_speed": 0, "route": "city"},
    {"id": "session_003", "start_speed": 0, "route": "offroad"},
]

rows = []
start_time = datetime(2025, 3, 1, 8, 0, 0)

for session in sessions:
    t = start_time
    lat = 34.0522 + random.uniform(-0.05, 0.05)
    lon = -118.2437 + random.uniform(-0.05, 0.05)
    speed = 0.0
    battery = 100.0

    for i in range(500):  # 500 data points per session
        t += timedelta(seconds=1)

        # Simulate speed changes
        if session["route"] == "highway":
            target_speed = 65
        elif session["route"] == "city":
            target_speed = 25
        else:
            target_speed = 15

        speed += random.uniform(-3, 3)
        speed = max(0, min(speed, target_speed + 10))

        # Simulate GPS movement
        lat += speed * 0.000001
        lon += speed * 0.000001

        # Simulate battery drain
        battery -= random.uniform(0.01, 0.05)
        battery = max(0, battery)

        # Simulate temperature
        temp = 72 + random.uniform(-5, 5) + (speed * 0.1)

        rows.append({
            "session_id": session["id"],
            "timestamp": t.isoformat(),
            "speed_mph": round(speed, 2),
            "gps_lat": round(lat, 6),
            "gps_lon": round(lon, 6),
            "battery_pct": round(battery, 2),
            "motor_temp_f": round(temp, 2),
            "route_type": session["route"],
        })

# Write to CSV
with open("sensor_data.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} sensor readings across {len(sessions)} sessions.")
print("File saved: sensor_data.csv")