import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

PERSONAS = {
    "YC Partner": {
        "style": "You are a YC partner — direct, pattern-matching against thousands of startups. You care deeply about founder-market fit, speed of iteration, and whether this can be a billion-dollar company. You hate vague TAM slides and buzzwords.",
        "weights": {"problem_severity": 0.20, "market_size": 0.15, "differentiation": 0.15, "business_model": 0.15, "traction": 0.20, "bullshit_score": 0.10, "founder_fit": 0.05}
    },
    "Sequoia India": {
        "style": "You are a Sequoia India partner. You think in terms of India-specific market dynamics, unit economics, and distribution moats. You want to see strong local insight and a clear path to dominance in the Indian market.",
        "weights": {"problem_severity": 0.15, "market_size": 0.20, "differentiation": 0.15, "business_model": 0.20, "traction": 0.15, "bullshit_score": 0.10, "founder_fit": 0.05}
    },
    "Tiger Global": {
        "style": "You are a Tiger Global analyst — growth-obsessed, metric-driven. You want to see massive revenue potential, strong retention numbers, and clear unit economics. You don't care about story, only numbers.",
        "weights": {"problem_severity": 0.10, "market_size": 0.20, "differentiation": 0.10, "business_model": 0.25, "traction": 0.25, "bullshit_score": 0.05, "founder_fit": 0.05}
    },
    "Angel Investor": {
        "style": "You are an experienced angel investor. You bet on people first, ideas second. You value founder passion, unique insight, and early traction over polished decks. You're more forgiving of vague models but unforgiving about authenticity.",
        "weights": {"problem_severity": 0.15, "market_size": 0.10, "differentiation": 0.15, "business_model": 0.10, "traction": 0.15, "bullshit_score": 0.15, "founder_fit": 0.20}
    }
}

DIMENSION_PROMPTS = {
    "problem_severity": "How severe, widespread, and painful is the problem? Is there evidence real people suffer from this? Score 0-10.",
    "market_size": "How large is the addressable market? Is the TAM reasoning specific or hand-wavy? Does this have billion-dollar potential? Score 0-10.",
    "differentiation": "How differentiated is the solution vs existing alternatives? Why can't someone just use Google/Excel/existing tools? Score 0-10.",
    "business_model": "How clear and viable is the business model? Is there a logical path to revenue and margins? Score 0-10.",
    "traction": "What traction signals exist — revenue, users, LOIs, pilots, waitlist? Zero traction scores low. Score 0-10.",
    "bullshit_score": "Rate the ABSENCE of bullshit — 10 means completely honest and specific, 0 means pure buzzword soup. Penalize: 'AI-powered', 'blockchain', 'disruptive', 'revolutionary', 'seamless', vague TAM claims. Score 0-10.",
    "founder_fit": "Does the pitch suggest the founder uniquely belongs in this space? Relevant experience, obsession, or unfair insight? Score 0-10."
}

async def evaluate_pitch(pitch_text: str, persona: str) -> dict:
    persona_config = PERSONAS.get(persona, PERSONAS["YC Partner"])
    
    # Stage 1: Extract pitch components
    extraction_prompt = f"""Extract the following from this startup pitch. Return ONLY a JSON object with these exact keys:
{{
  "problem": "what problem they're solving",
  "solution": "what they're building",
  "market": "target market and size claims",
  "business_model": "how they make money",
  "traction": "any traction mentioned",
  "team": "any team info mentioned",
  "differentiator": "why they're different"
}}

If a field is not mentioned, use "Not mentioned".

PITCH:
{pitch_text}"""

    extraction_response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": extraction_prompt}],
        temperature=0.3,
        max_tokens=800
    )
    
    raw = extraction_response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    try:
        components = json.loads(raw)
    except:
        components = {"problem": "Parse error", "solution": pitch_text[:200], "market": "N/A", "business_model": "N/A", "traction": "N/A", "team": "N/A", "differentiator": "N/A"}

    # Stage 2: Score each dimension
    scores = {}
    critiques = {}
    
    scoring_prompt = f"""{persona_config["style"]}

Evaluate this startup pitch across 7 dimensions. For each dimension, provide:
1. A score from 0-10 (integer only)
2. A brutal 1-2 sentence critique (no sugarcoating)

Return ONLY a JSON object with this structure:
{{
  "problem_severity": {{"score": 7, "critique": "..."}},
  "market_size": {{"score": 4, "critique": "..."}},
  "differentiation": {{"score": 6, "critique": "..."}},
  "business_model": {{"score": 5, "critique": "..."}},
  "traction": {{"score": 2, "critique": "..."}},
  "bullshit_score": {{"score": 8, "critique": "..."}},
  "founder_fit": {{"score": 5, "critique": "..."}}
}}

Extracted pitch components:
{json.dumps(components, indent=2)}

Original pitch:
{pitch_text[:1500]}

Scoring guidance per dimension:
- problem_severity: {DIMENSION_PROMPTS["problem_severity"]}
- market_size: {DIMENSION_PROMPTS["market_size"]}
- differentiation: {DIMENSION_PROMPTS["differentiation"]}
- business_model: {DIMENSION_PROMPTS["business_model"]}
- traction: {DIMENSION_PROMPTS["traction"]}
- bullshit_score: {DIMENSION_PROMPTS["bullshit_score"]}
- founder_fit: {DIMENSION_PROMPTS["founder_fit"]}"""

    scoring_response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": scoring_prompt}],
        temperature=0.4,
        max_tokens=1200
    )
    
    raw2 = scoring_response.choices[0].message.content.strip()
    raw2 = re.sub(r"```json|```", "", raw2).strip()
    try:
        dimension_results = json.loads(raw2)
    except:
        dimension_results = {k: {"score": 5, "critique": "Could not parse."} for k in DIMENSION_PROMPTS}

    # Stage 3: Compute weighted score + verdict
    weights = persona_config["weights"]
    weighted_score = 0
    for dim, w in weights.items():
        s = dimension_results.get(dim, {}).get("score", 5)
        weighted_score += s * w
    fundability = round(weighted_score, 1)

    if fundability >= 7.5:
        verdict = "PASS"
        verdict_label = "Strong Consider"
    elif fundability >= 5.5:
        verdict = "WATCH"
        verdict_label = "Needs Work"
    else:
        verdict = "KILL"
        verdict_label = "Pass"

    # Stage 4: VC questions + fatal flaw
    verdict_prompt = f"""{persona_config["style"]}

Based on this startup pitch, give:
1. The 3 hardest questions you would immediately ask in the pitch meeting
2. One "fatal flaw" — the single biggest reason this might fail (or "None identified" if the pitch is strong)
3. One specific thing they should fix before their next pitch

Return ONLY a JSON object:
{{
  "vc_questions": ["question 1", "question 2", "question 3"],
  "fatal_flaw": "...",
  "one_fix": "..."
}}

Pitch:
{pitch_text[:1500]}"""

    verdict_response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": verdict_prompt}],
        temperature=0.5,
        max_tokens=600
    )
    
    raw3 = verdict_response.choices[0].message.content.strip()
    raw3 = re.sub(r"```json|```", "", raw3).strip()
    try:
        verdict_details = json.loads(raw3)
    except:
        verdict_details = {
            "vc_questions": ["What's your traction?", "Who else is building this?", "Why you?"],
            "fatal_flaw": "Could not parse.",
            "one_fix": "Could not parse."
        }

    return {
        "components": components,
        "dimensions": dimension_results,
        "fundability_score": fundability,
        "verdict": verdict,
        "verdict_label": verdict_label,
        "persona": persona,
        "vc_questions": verdict_details.get("vc_questions", []),
        "fatal_flaw": verdict_details.get("fatal_flaw", ""),
        "one_fix": verdict_details.get("one_fix", "")
    }