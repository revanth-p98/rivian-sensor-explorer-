from fastapi.responses import StreamingResponse
import io
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional

# Create the app
app = FastAPI(title="Rivian Sensor Data Explorer", version="1.0")

# CORS: This lets our React frontend talk to this backend
# Without this, your browser will block the connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the sensor data once when the server starts
# (In real systems, this would be a database of petabytes of data)
print("Loading sensor data...")
df = pd.read_csv("sensor_data.csv")
print(f"Loaded {len(df)} rows of sensor data.")


# ───────────────────────────────────────────────
# ENDPOINT 1: Get all session IDs
# URL: GET http://localhost:8000/api/sessions
# ───────────────────────────────────────────────
@app.get("/api/sessions")
def get_sessions():
    """Returns the list of all driving sessions."""
    sessions = df["session_id"].unique().tolist()
    counts = df.groupby("session_id").size().to_dict()

    result = []
    for s in sessions:
        first_row = df[df["session_id"] == s].iloc[0]
        result.append({
            "session_id": s,
            "route_type": first_row["route_type"],
            "data_points": counts[s],
            "start_time": first_row["timestamp"],
        })
    return {"sessions": result}


# ───────────────────────────────────────────────
# ENDPOINT 2: Get data for a specific session
# URL: GET http://localhost:8000/api/session/session_001
# ───────────────────────────────────────────────
@app.get("/api/session/{session_id}")
def get_session_data(session_id: str, limit: int = 100):
    """Returns the sensor data for one session."""
    session_df = df[df["session_id"] == session_id]

    if session_df.empty:
        return {"error": f"Session '{session_id}' not found."}

    # Return only 'limit' rows so the frontend isn't overwhelmed
    sampled = session_df.head(limit)

    return {
        "session_id": session_id,
        "total_points": len(session_df),
        "showing": len(sampled),
        "data": sampled.to_dict(orient="records"),
        "stats": {
            "avg_speed": round(session_df["speed_mph"].mean(), 2),
            "max_speed": round(session_df["speed_mph"].max(), 2),
            "min_battery": round(session_df["battery_pct"].min(), 2),
            "avg_motor_temp": round(session_df["motor_temp_f"].mean(), 2),
        }
    }


# ───────────────────────────────────────────────
# ENDPOINT 3: Search / filter data
# URL: GET http://localhost:8000/api/search?min_speed=50&route_type=highway
# ───────────────────────────────────────────────
@app.get("/api/search")
def search_data(
    session_id: Optional[str] = None,
    route_type: Optional[str] = None,
    min_speed: Optional[float] = None,
    max_speed: Optional[float] = None,
    min_battery: Optional[float] = None,
):
    """Search and filter sensor data by various conditions."""
    result = df.copy()

    if session_id:
        result = result[result["session_id"] == session_id]
    if route_type:
        result = result[result["route_type"] == route_type]
    if min_speed is not None:
        result = result[result["speed_mph"] >= min_speed]
    if max_speed is not None:
        result = result[result["speed_mph"] <= max_speed]
    if min_battery is not None:
        result = result[result["battery_pct"] >= min_battery]

    return {
        "total_matches": len(result),
        "data": result.head(200).to_dict(orient="records"),
    }


# ───────────────────────────────────────────────
# ENDPOINT 4: Summary statistics
# URL: GET http://localhost:8000/api/stats
# ───────────────────────────────────────────────
@app.get("/api/stats")
def get_stats():
    """Returns overall statistics across all sessions."""
    return {
        "total_data_points": len(df),
        "total_sessions": df["session_id"].nunique(),
        "route_types": df["route_type"].unique().tolist(),
        "overall_avg_speed": round(df["speed_mph"].mean(), 2),
        "overall_max_speed": round(df["speed_mph"].max(), 2),
        "overall_avg_battery": round(df["battery_pct"].mean(), 2),
    }


@app.get("/api/export/{session_id}")
def export_session(session_id: str):
    """Export session data as a downloadable CSV."""
    session_df = df[df["session_id"] == session_id]
    if session_df.empty:
        return {"error": "Session not found"}

    stream = io.StringIO()
    session_df.to_csv(stream, index=False)
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={session_id}.csv"}
    )
    return response
