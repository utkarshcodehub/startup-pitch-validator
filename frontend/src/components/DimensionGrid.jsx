function scoreColor(s) {
  if (s >= 7) return "#22c55e";
  if (s >= 5) return "#f59e0b";
  return "#ef4444";
}

export default function DimensionGrid({ dimensions, labels }) {
  return (
    <div className="dim-section">
      <h3 className="section-title">DIMENSION BREAKDOWN</h3>
      <div className="dim-grid">
        {Object.entries(dimensions).map(([key, val]) => {
          const score = val?.score ?? 0;
          const critique = val?.critique ?? "";
          const color = scoreColor(score);
          return (
            <div key={key} className="dim-card">
              <div className="dim-top">
                <span className="dim-name">{labels[key] || key}</span>
                <span className="dim-score" style={{ color }}>{score}<span className="dim-denom">/10</span></span>
              </div>
              <div className="dim-bar-track">
                <div className="dim-bar-fill" style={{ width: `${score * 10}%`, background: color }} />
              </div>
              <p className="dim-critique">{critique}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
