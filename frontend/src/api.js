// frontend/src/api.js

export async function generatePlan(payload) {
  const response = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // IMPORTANT: always parse JSON first
  const data = await response.json();

  if (!response.ok) {
    console.error("Backend error:", data);
    throw new Error("Backend failed");
  }

  return data;
}