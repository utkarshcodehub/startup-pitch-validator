import os
from supabase import create_client
import json
from datetime import datetime

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = None
if url and key:
    supabase = create_client(url, key)

TABLE = "pitch_evaluations"

def save_evaluation(pitch_text: str, persona: str, result: dict) -> str:
    if not supabase:
        return "no-db"
    try:
        data = {
            "pitch_text": pitch_text[:500],
            "persona": persona,
            "scores_json": json.dumps(result.get("dimensions", {})),
            "fundability_score": result.get("fundability_score", 0),
            "verdict": result.get("verdict", ""),
            "created_at": datetime.utcnow().isoformat()
        }
        res = supabase.table(TABLE).insert(data).execute()
        return res.data[0]["id"] if res.data else "unknown"
    except Exception as e:
        print(f"DB save error: {e}")
        return "error"

def get_history():
    if not supabase:
        return []
    try:
        res = supabase.table(TABLE).select("*").order("created_at", desc=True).limit(20).execute()
        return res.data or []
    except Exception as e:
        print(f"DB fetch error: {e}")
        return []

def delete_evaluation(eval_id: str):
    if not supabase:
        return
    try:
        supabase.table(TABLE).delete().eq("id", eval_id).execute()
    except Exception as e:
        print(f"DB delete error: {e}")
