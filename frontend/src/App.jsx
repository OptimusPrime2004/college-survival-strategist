import { useState } from "react";
import { generatePlan } from "./api";
import "./styles.css";

export default function App() {
  const [subjects, setSubjects] = useState("");
  const [dates, setDates] = useState("");
  const [attendance, setAttendance] = useState(80);
  const [hours, setHours] = useState(3);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    const subjectList = subjects
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const dateList = dates
      .split(",")
      .map(d => d.trim())
      .filter(Boolean);

    if (subjectList.length === 0 || subjectList.length !== dateList.length) {
      setError("Subjects and dates must match.");
      return;
    }

    const payload = {
      subjects: subjects.split(",").map(s => s.trim()).filter(Boolean),
      exam_dates: exam_dates.split(",").map(d => d.trim()).filter(Boolean),
      attendance_percentage: Number(attendance),
      daily_study_hours: Number(hours),
    };

    try {
      setLoading(true);
      const data = await generatePlan(payload);
      setResult(data);
    } catch (e) {
      setError("Failed to generate plan. Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper" data-theme={theme}>
      <div className="card">
        <div className="header">
          <h1>College Survival Strategist</h1>
          <button
            className="theme-toggle"
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <p className="subtitle">
          Smart prioritization with explainable reasoning & resources
        </p>

        <div className="form">
          <label>Subjects (comma separated)</label>
          <input
            value={subjects}
            onChange={e => setSubjects(e.target.value)}
            placeholder="os, dbms, math"
          />

          <label>Exam Dates (same order, YYYY-MM-DD)</label>
          <input
            value={dates}
            onChange={e => setDates(e.target.value)}
            placeholder="2026-03-01,2026-03-10,2026-03-19"
          />

          <label>Attendance Percentage</label>
          <input
            type="number"
            value={attendance}
            onChange={e => setAttendance(e.target.value)}
          />

          <label>Daily Study Hours</label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
          />

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Generating..." : "Generate Survival Plan"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        {result && (
          <div className="result">
            <h3>{result.summary}</h3>

            <div className="plan-grid">
              {result.plan.map((item, idx) => (
                <div key={idx} className="subject-card">
                  <strong>{item.subject.toUpperCase()}</strong>
                  <p>Days Left: {item.days_left}</p>
                  <p>Urgency Score: {item.urgency_score}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}