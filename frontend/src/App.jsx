import { useState } from "react";
import PitchInput from "./components/PitchInput";
import ResultPanel from "./components/ResultPanel";
import HistoryPanel from "./components/HistoryPanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pitch");

  async function handleSubmit(pitchText, persona) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch_text: pitchText, persona }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Evaluation failed");
      }
      const data = await res.json();
      setResult(data);
      setTab("result");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-mark">▲</span>
            <span className="logo-text">PITCHKILL</span>
            <span className="logo-sub">VC Evaluation Engine</span>
          </div>
          <nav className="tab-nav">
            <button className={`tab-btn ${tab === "pitch" ? "active" : ""}`} onClick={() => setTab("pitch")}>Submit Pitch</button>
            {result && <button className={`tab-btn ${tab === "result" ? "active" : ""}`} onClick={() => setTab("result")}>Results</button>}
            <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>History</button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {tab === "pitch" && (
          <PitchInput onSubmit={handleSubmit} loading={loading} error={error} />
        )}
        {tab === "result" && result && (
          <ResultPanel result={result} onBack={() => setTab("pitch")} />
        )}
        {tab === "history" && (
          <HistoryPanel api={API} />
        )}
      </main>
    </div>
  );
}
