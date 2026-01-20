import { useState } from "react";
import { generatePlan } from "./api";

function App() {
  const [subjects, setSubjects] = useState("");
  const [examDates, setExamDates] = useState("");
  const [attendance, setAttendance] = useState(80);
  const [dailyHours, setDailyHours] = useState(3);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    // --- STRICT, SAFE PARSING ---
    const subjectsArray = subjects
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const examDatesArray = examDates
      .split(",")
      .map(d => d.trim())
      .filter(Boolean);

    if (subjectsArray.length === 0) {
      setError("Please enter at least one subject.");
      return;
    }

    if (subjectsArray.length !== examDatesArray.length) {
      setError("Number of subjects and exam dates must match.");
      return;
    }

    const payload = {
      subjects: subjectsArray,
      exam_dates: examDatesArray,
      attendance: Number(attendance),
      daily_hours: Number(dailyHours),
    };

    console.log("FINAL PAYLOAD SENT →", payload);

    try {
      setLoading(true);
      const data = await generatePlan(payload);
      setResult(data);
    } catch (err) {
      console.error("Frontend caught error:", err);
      setError("Failed to generate plan. Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>College Survival Strategist</h1>
      <p>Smart prioritization with explainable reasoning & resources</p>

      <label>Subjects (comma separated)</label>
      <input
        type="text"
        value={subjects}
        onChange={e => setSubjects(e.target.value)}
        placeholder="os, dbms, math"
        style={{ width: "100%", marginBottom: "12px" }}
      />

      <label>Exam Dates (same order, YYYY-MM-DD)</label>
      <input
        type="text"
        value={examDates}
        onChange={e => setExamDates(e.target.value)}
        placeholder="2026-03-01,2026-03-03,2026-03-10"
        style={{ width: "100%", marginBottom: "12px" }}
      />

      <label>Attendance Percentage</label>
      <input
        type="number"
        value={attendance}
        onChange={e => setAttendance(e.target.value)}
        style={{ width: "100%", marginBottom: "12px" }}
      />

      <label>Daily Study Hours</label>
      <input
        type="number"
        value={dailyHours}
        onChange={e => setDailyHours(e.target.value)}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Survival Plan"}
      </button>

      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}

      {result && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "16px",
            marginTop: "20px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;