import { useState } from "react";

const PERSONAS = ["YC Partner", "Sequoia India", "Tiger Global", "Angel Investor"];

const PERSONA_DESC = {
  "YC Partner": "Founder-market fit, speed, billion-dollar potential",
  "Sequoia India": "India dynamics, unit economics, distribution moats",
  "Tiger Global": "Revenue, growth metrics, unit economics only",
  "Angel Investor": "People first, insight, authenticity"
};

const EXAMPLE_PITCH = `We're building Medlink, a WhatsApp-based healthcare assistant for tier-2 and tier-3 India. 

Problem: 650 million Indians have no reliable access to a doctor. Government PHCs are understaffed and 3-hour waits are the norm. People turn to local chemists who prescribe incorrectly.

Solution: Patients message a WhatsApp number, describe symptoms in Hindi/regional languages, and get an AI-triaged response with a local doctor callback within 2 hours for ₹49.

Market: India's digital health market is $21B by 2025. We're targeting the 400M smartphone users in non-metro India who've never used Practo or Apollo.

Traction: 1,200 consultations in 3 months across 4 districts in UP. 68% return rate. 2 government PHC partnerships signed.

Team: I'm a doctor (AIIMS), my co-founder ran growth at PharmEasy. We've been living this problem.

Business model: ₹49/consult, ₹199/month subscription. Targeting 10% margin at scale from pharma delivery integration.`;

export default function PitchInput({ onSubmit, loading, error }) {
  const [pitch, setPitch] = useState("");
  const [persona, setPersona] = useState("YC Partner");

  return (
    <div className="pitch-page">
      <div className="pitch-hero">
        <h1 className="hero-title">Your pitch has<br /><em>30 seconds.</em></h1>
        <p className="hero-sub">We simulate a real VC evaluation across 7 dimensions. No flattery. No participation trophies.</p>
      </div>

      <div className="pitch-form-grid">
        <div className="form-left">
          <label className="field-label">EVALUATOR PERSONA</label>
          <div className="persona-grid">
            {PERSONAS.map(p => (
              <button
                key={p}
                className={`persona-card ${persona === p ? "selected" : ""}`}
                onClick={() => setPersona(p)}
              >
                <span className="persona-name">{p}</span>
                <span className="persona-desc">{PERSONA_DESC[p]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-right">
          <div className="field-header">
            <label className="field-label">YOUR PITCH</label>
            <button className="example-btn" onClick={() => setPitch(EXAMPLE_PITCH)}>Load Example</button>
          </div>
          <textarea
            className="pitch-textarea"
            value={pitch}
            onChange={e => setPitch(e.target.value)}
            placeholder="Paste your pitch deck summary, elevator pitch, or startup description. Include: problem, solution, market size, business model, traction, and team if you have them."
            rows={14}
          />
          <div className="char-count">{pitch.length} chars · min 50</div>

          {error && <div className="error-bar">⚠ {error}</div>}

          <button
            className="submit-btn"
            onClick={() => onSubmit(pitch, persona)}
            disabled={loading || pitch.length < 50}
          >
            {loading ? (
              <span className="loading-state">
                <span className="spinner" />
                Evaluating as {persona}...
              </span>
            ) : (
              "Submit to Panel →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
