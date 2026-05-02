import DimensionGrid from "./DimensionGrid";
import VerdictBanner from "./VerdictBanner";

const DIM_LABELS = {
  problem_severity: "Problem Severity",
  market_size: "Market Size",
  differentiation: "Differentiation",
  business_model: "Business Model",
  traction: "Traction",
  bullshit_score: "Clarity Score",
  founder_fit: "Founder Fit"
};

export default function ResultPanel({ result, onBack }) {
  return (
    <div className="result-page">
      <div className="result-header">
        <button className="back-btn" onClick={onBack}>← New Pitch</button>
        <span className="persona-tag">Evaluated as: {result.persona}</span>
      </div>

      <VerdictBanner
        verdict={result.verdict}
        verdictLabel={result.verdict_label}
        score={result.fundability_score}
      />

      <DimensionGrid dimensions={result.dimensions} labels={DIM_LABELS} />

      <div className="insight-grid">
        <div className="insight-card fatal">
          <h3 className="insight-title">FATAL FLAW</h3>
          <p className="insight-body">{result.fatal_flaw || "None identified."}</p>
        </div>
        <div className="insight-card fix">
          <h3 className="insight-title">ONE THING TO FIX</h3>
          <p className="insight-body">{result.one_fix}</p>
        </div>
      </div>

      <div className="vc-questions-block">
        <h3 className="section-title">QUESTIONS YOU'LL GET IN THE ROOM</h3>
        <div className="questions-list">
          {result.vc_questions.map((q, i) => (
            <div key={i} className="question-row">
              <span className="q-num">Q{i + 1}</span>
              <span className="q-text">{q}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="components-block">
        <h3 className="section-title">WHAT WE EXTRACTED FROM YOUR PITCH</h3>
        <div className="components-grid">
          {Object.entries(result.components).map(([k, v]) => (
            <div key={k} className="component-item">
              <span className="comp-key">{k.replace(/_/g, " ").toUpperCase()}</span>
              <span className="comp-val">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
