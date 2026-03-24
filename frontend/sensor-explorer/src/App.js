import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

// This is the address of our Python backend
const API_BASE = 'http://localhost:8000';

function App() {
    // "State" = variables that React watches. When they change, the screen updates.
    const [sessions, setSessions] = useState([]);          // List of all sessions
    const [selectedSession, setSelectedSession] = useState(null);  // Currently selected session
    const [sessionData, setSessionData] = useState(null);  // Data for selected session
    const [stats, setStats] = useState(null);              // Overall stats
    const [searchFilters, setSearchFilters] = useState({   // Search form values
        route_type: '',
        min_speed: '',
        max_speed: '',
        min_battery: '',
    });
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);

    // useEffect runs once when the page loads
    useEffect(() => {
        // Fetch overall stats
        axios.get(`${API_BASE}/api/stats`)
            .then(res => setStats(res.data))
            .catch(err => console.error('Error fetching stats:', err));

        // Fetch all sessions
        axios.get(`${API_BASE}/api/sessions`)
            .then(res => setSessions(res.data.sessions))
            .catch(err => console.error('Error fetching sessions:', err));
    }, []);

    // When user clicks a session, fetch its data
    const loadSession = (sessionId) => {
        setLoading(true);
        setSelectedSession(sessionId);
        axios.get(`${API_BASE}/api/session/${sessionId}?limit=100`)
            .then(res => {
                setSessionData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching session:', err);
                setLoading(false);
            });
    };

    // Run search when user submits the search form
    const runSearch = () => {
        const params = {};
        if (searchFilters.route_type) params.route_type = searchFilters.route_type;
        if (searchFilters.min_speed) params.min_speed = searchFilters.min_speed;
        if (searchFilters.max_speed) params.max_speed = searchFilters.max_speed;
        if (searchFilters.min_battery) params.min_battery = searchFilters.min_battery;

        setLoading(true);
        axios.get(`${API_BASE}/api/search`, { params })
            .then(res => {
                setSearchResults(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error searching:', err);
                setLoading(false);
            });
    };

    return (
        <div className="app">
            {/* ── Header ── */}
            <header className="header">
                <h1>🚙 Rivian Sensor Data Explorer</h1>
                <p>Search, visualize, and extract insights from vehicle sensor data</p>
            </header>

            {/* ── Overall Stats Cards ── */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total_data_points.toLocaleString()}</div>
                        <div className="stat-label">Total Data Points</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.total_sessions}</div>
                        <div className="stat-label">Driving Sessions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.overall_avg_speed} mph</div>
                        <div className="stat-label">Avg Speed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.overall_avg_battery}%</div>
                        <div className="stat-label">Avg Battery</div>
                    </div>
                </div>
            )}

            <div className="main-layout">
                {/* ── Left Sidebar: Session List ── */}
                <div className="sidebar">
                    <h2>Sessions</h2>
                    {sessions.map(session => (
                        <div
                            key={session.session_id}
                            className={`session-card ${selectedSession === session.session_id ? 'active' : ''}`}
                            onClick={() => loadSession(session.session_id)}
                        >
                            <strong>{session.session_id}</strong>
                            <div>{session.route_type} route</div>
                            <div>{session.data_points} data points</div>
                        </div>
                    ))}
                </div>

                {/* ── Right: Charts + Search ── */}
                <div className="content">
                    {/* Search Panel */}
                    <div className="search-panel">
                        <h2>Search & Filter</h2>
                        <div className="search-row">
                            <select
                                value={searchFilters.route_type}
                                onChange={e => setSearchFilters({ ...searchFilters, route_type: e.target.value })}
                            >
                                <option value="">All routes</option>
                                <option value="highway">Highway</option>
                                <option value="city">City</option>
                                <option value="offroad">Off-road</option>
                            </select>

                            <input
                                type="number"
                                placeholder="Min speed (mph)"
                                value={searchFilters.min_speed}
                                onChange={e => setSearchFilters({ ...searchFilters, min_speed: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Max speed (mph)"
                                value={searchFilters.max_speed}
                                onChange={e => setSearchFilters({ ...searchFilters, max_speed: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Min battery (%)"
                                value={searchFilters.min_battery}
                                onChange={e => setSearchFilters({ ...searchFilters, min_battery: e.target.value })}
                            />
                            <button onClick={runSearch} className="search-btn">Search</button>
                        </div>
                        {searchResults && (
                            <p className="search-result-count">
                                Found <strong>{searchResults.total_matches}</strong> matching data points
                            </p>
                        )}
                    </div>

                    {/* Charts for selected session */}
                    {loading && <p>Loading...</p>}

                    {sessionData && !loading && (
                        <div className="charts-area">
                            <h2>
                                {selectedSession} — {sessionData.data[0]?.route_type} route
                            </h2>

                            {/* Stats row */}
                            <div className="mini-stats">
                                <span>Avg Speed: <strong>{sessionData.stats.avg_speed} mph</strong></span>
                                <span>Max Speed: <strong>{sessionData.stats.max_speed} mph</strong></span>
                                <span>Min Battery: <strong>{sessionData.stats.min_battery}%</strong></span>
                                <span>Avg Motor Temp: <strong>{sessionData.stats.avg_motor_temp}°F</strong></span>
                            </div>

                            {/* Speed Chart */}
                            <div className="chart-container">
                                <h3>Speed Over Time</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sessionData.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="speed_mph"
                                            stroke="#00a651"
                                            dot={false}
                                            name="Speed (mph)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Battery Chart */}
                            <div className="chart-container">
                                <h3>Battery Level Over Time</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sessionData.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="battery_pct"
                                            stroke="#1e3a8a"
                                            dot={false}
                                            name="Battery %"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Motor Temp Chart */}
                            <div className="chart-container">
                                <h3>Motor Temperature Over Time</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sessionData.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="motor_temp_f"
                                            stroke="#dc2626"
                                            dot={false}
                                            name="Motor Temp (°F)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {!sessionData && !loading && (
                        <div className="placeholder">
                            <p>👈 Select a session from the left to see its charts</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;