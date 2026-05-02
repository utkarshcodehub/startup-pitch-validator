from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
from evaluator import evaluate_pitch
from db import save_evaluation, get_history, delete_evaluation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PitchRequest(BaseModel):
    pitch_text: str
    persona: str = "YC Partner"

@app.post("/evaluate")
async def evaluate(req: PitchRequest):
    if len(req.pitch_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Pitch too short. Give us something to work with.")
    result = await evaluate_pitch(req.pitch_text, req.persona)
    saved = save_evaluation(req.pitch_text, req.persona, result)
    result["id"] = saved
    return result

@app.get("/history")
def history():
    return get_history()

@app.delete("/history/{eval_id}")
def delete(eval_id: str):
    delete_evaluation(eval_id)
    return {"status": "deleted"}

@app.get("/health")
def health():
    return {"status": "ok"}