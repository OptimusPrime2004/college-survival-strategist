import { useState, useEffect } from "react";
import { generatePlan } from "./api";
import "./styles.css";

// College Survival Strategist - Production Ready
export default function App() {
  const [subjects, setSubjects] = useState("");
  const [examDates, setExamDates] = useState("");
  const [attendance, setAttendance] = useState(80);
  const [dailyHours, setDailyHours] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    const subjectList = subjects.split(",").map(s => s.trim()).filter(Boolean);
    const dateList = examDates.split(",").map(d => d.trim()).filter(Boolean);

    if (
      subjectList.length === 0 ||
      dateList.length === 0 ||
      subjectList.length !== dateList.length
    ) {
      setError("Subjects and exam dates must be valid and equal in count.");
      return;
    }

    try {
      setLoading(true);

      const data = await generatePlan({
        subjects: subjectList,
        exam_dates: dateList,
        attendance_percentage: Number(attendance),
        daily_study_hours: Number(dailyHours)
      });

      setResult(data);
    } catch (err) {
      setError("Failed to generate plan. Check inputs or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="header">
          <h1>College Survival Strategist</h1>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <p className="subtitle">
          Smart prioritization with explainable reasoning & resources
        </p>

        <label>Subjects (comma separated)</label>
        <input
          value={subjects}
          onChange={e => setSubjects(e.target.value)}
          placeholder="os, dbms, math"
        />

        <label>Exam Dates (same order, YYYY-MM-DD)</label>
        <input
          value={examDates}
          onChange={e => setExamDates(e.target.value)}
          placeholder="2026-03-01,2026-03-10,2026-03-18"
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
          value={dailyHours}
          onChange={e => setDailyHours(e.target.value)}
        />

        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Survival Plan"}
        </button>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h3>{result.summary}</h3>
            
            <h4>Priority Subjects</h4>
            <ul>
              {result.plan.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.subject.toUpperCase()}</strong> —{" "}
                  {item.days_left} days left (Urgency {item.urgency_score})
                </li>
              ))}
            </ul>

            {result.attendance_advice && (
              <div className="advice-section">
                <h4>Attendance Advice</h4>
                <p>{result.attendance_advice}</p>
              </div>
            )}

            {result.weekly_plan && (
              <div className="weekly-plan-section">
                <h4>Weekly Study Plan</h4>
                <ol>
                  {result.weekly_plan.map((day, idx) => (
                    <li key={idx}>{day}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.resources && Object.keys(result.resources).length > 0 && (
              <div className="resources-section">
                <h4>Recommended Resources</h4>
                {Object.entries(result.resources).map(([subject, resources]) => (
                  <div key={subject} className="subject-resources">
                    <h5>{subject.toUpperCase()}</h5>
                    {resources.youtube && (
                      <div>
                        <strong>YouTube:</strong>
                        <ul>
                          {resources.youtube.map((video, idx) => (
                            <li key={idx}>{video}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {resources.strategy && (
                      <div>
                        <strong>Strategy:</strong>
                        <p>{resources.strategy}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}