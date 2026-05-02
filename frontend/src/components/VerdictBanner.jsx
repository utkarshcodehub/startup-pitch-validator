export default function VerdictBanner({ verdict, verdictLabel, score }) {
  const cls = verdict === "PASS" ? "pass" : verdict === "WATCH" ? "watch" : "kill";
  const scoreColor = score >= 7.5 ? "#22c55e" : score >= 5.5 ? "#f59e0b" : "#ef4444";

  return (
    <div className={`verdict-banner ${cls}`}>
      <div className="verdict-left">
        <div className={`verdict-tag ${cls}`}>{verdict}</div>
        <div className="verdict-label">{verdictLabel}</div>
      </div>
      <div className="verdict-score-block">
        <div className="score-number" style={{ color: scoreColor }}>{score}</div>
        <div className="score-denom">/10</div>
        <div className="score-label">Fundability</div>
      </div>
      <div className="verdict-right">
        <div className="score-bar-wrap">
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${score * 10}%`, background: scoreColor }}
            />
          </div>
          <div className="score-bar-labels">
            <span>KILL</span><span>WATCH</span><span>PASS</span>
          </div>
          <div className="score-thresholds">
            <div className="threshold" style={{ left: "55%" }} />
            <div className="threshold" style={{ left: "75%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
