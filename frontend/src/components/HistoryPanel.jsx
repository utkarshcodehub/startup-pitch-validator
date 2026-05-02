import { useState, useEffect } from "react";

export default function HistoryPanel({ api }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${api}/history`)
      .then(r => r.json())
      .then(d => { setHistory(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    await fetch(`${api}/history/${id}`, { method: "DELETE" });
    setHistory(h => h.filter(x => x.id !== id));
  }

  const verdictColor = { PASS: "#22c55e", WATCH: "#f59e0b", KILL: "#ef4444" };

  return (
    <div className="history-page">
      <h2 className="section-title">PITCH HISTORY</h2>
      {loading && <div className="loading-text">Loading...</div>}
      {!loading && history.length === 0 && (
        <div className="empty-state">No pitches evaluated yet. Submit your first pitch.</div>
      )}
      <div className="history-list">
        {history.map(item => (
          <div key={item.id} className="history-card">
            <div className="history-left">
              <span className="history-verdict" style={{ color: verdictColor[item.verdict] || "#fff" }}>
                {item.verdict}
              </span>
              <span className="history-score">{item.fundability_score}/10</span>
              <span className="history-persona">{item.persona}</span>
            </div>
            <div className="history-text">{item.pitch_text}</div>
            <div className="history-right">
              <span className="history-date">{new Date(item.created_at).toLocaleDateString()}</span>
              <button className="delete-btn" onClick={() => handleDelete(item.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
