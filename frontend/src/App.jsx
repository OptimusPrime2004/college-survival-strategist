import { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [subjects, setSubjects] = useState("");
  const [examDates, setExamDates] = useState("");
  const [attendance, setAttendance] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const handleGeneratePlan = async () => {
    setError("");
    setResult(null);

    try {
      const payload = {
        subjects: subjects
          .split(",")
          .map(s => s.trim())
          .filter(Boolean),

        exam_dates: examDates
          .split(",")
          .map(d => d.trim())
          .filter(Boolean),

        attendance: Number(attendance),
        daily_hours: Number(dailyHours)
      };

      console.log("Payload sent to backend:", payload);

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate plan. Check inputs.");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>College Survival Strategist</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
        <p className="subtitle">
          Smart prioritization with explainable reasoning & resources
        </p>
      </header>

      <div className="card">
        <label>
          Subjects (comma separated)
          <input
            type="text"
            value={subjects}
            onChange={e => setSubjects(e.target.value)}
            placeholder="os, dbms, math"
          />
        </label>

        <label>
          Exam Dates (same order, YYYY-MM-DD)
          <input
            type="text"
            value={examDates}
            onChange={e => setExamDates(e.target.value)}
            placeholder="2026-03-04, 2026-03-10, 2026-03-14"
          />
        </label>

        <label>
          Attendance Percentage
          <input
            type="number"
            value={attendance}
            onChange={e => setAttendance(e.target.value)}
            placeholder="80"
          />
        </label>

        <label>
          Daily Study Hours
          <input
            type="number"
            value={dailyHours}
            onChange={e => setDailyHours(e.target.value)}
            placeholder="3"
          />
        </label>

        <button className="primary-btn" onClick={handleGeneratePlan}>
          Generate Survival Plan
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <div className="results">
          <div className={`risk risk-${result.risk_level?.toLowerCase()}`}>
            ⚠ Risk Level: {result.risk_level}
          </div>

          <div className="result-card">
            <h3>Subject Priority</h3>
            <ul>
              {result.subject_priority.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {result.weekly_plan && (
            <div className="result-card">
              <h3>Weekly Survival Plan</h3>
              <ul>
                {result.weekly_plan.map((day, i) => (
                  <li key={i}>{day}</li>
                ))}
              </ul>
            </div>
          )}

          {result.attendance_advice && (
            <div className="result-card">
              <h3>Attendance Advice</h3>
              <p>{result.attendance_advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}