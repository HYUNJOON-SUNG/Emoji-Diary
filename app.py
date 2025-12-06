from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum
from contextlib import asynccontextmanager
import sys
import base64
import os
from pathlib import Path
import uvicorn

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from server.middleware.anaysis_emotion import (
    load_trained_model,
    predict_emotion,
    initialize_tokenizer_and_vocab
)
from server.middleware.nano_banana import nano_banana
from server.middleware.feedback import generate_feedback
import json

emotion_model = None
tokenizer = None
vocab = None
max_len = 128

@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행되는 함수"""
    global emotion_model, tokenizer, vocab
    
    print("감정 분석 모델 로드 중...")
    
    possible_paths = [
        project_root / "server" / "model" / "best_model.pt",  
        project_root / "model" / "best_model.pt",  
        project_root / "best_model.pt",  
    ]
    
    model_path = None
    for path in possible_paths:
        if path.exists():
            model_path = path
            print(f"모델 파일 발견: {model_path}")
            break
    
    if model_path and model_path.exists():
        tokenizer, vocab = initialize_tokenizer_and_vocab()
        emotion_model = load_trained_model(str(model_path))
        print(f"✓ 감정 분석 모델 로드 완료: {model_path}")
    else:
        print(f"⚠ 모델 파일을 찾을 수 없습니다. 다음 경로를 확인했습니다:")
        for path in possible_paths:
            print(f"  - {path} (존재: {path.exists()})")
    
    yield
    
    print("앱 종료 중...")

app = FastAPI(lifespan=lifespan)

class Weather(str, Enum):
    SUNNY = "SUNNY"
    CLOUDY = "CLOUDY"
    RAINY = "RAINY"
    SNOWY = "SNOWY"
    WINDY = "WINDY"

class Persona(str, Enum):
    BEST_FRIEND = "BEST_FRIEND"
    PARENTS = "PARENTS"
    EXPERT = "EXPERT"
    MENTOR = "MENTOR"
    COUNSELOR = "COUNSELOR"
    POET = "POET"

class Sex(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"

class AiServerRequest(BaseModel):
    content: str
    weather: Weather
    persona: Persona
    sex: Sex

class EmotionAnalysisResult(BaseModel):
    emotion: str
    confidence: float
    probabilities: dict

@app.get("/")
def read_root():
    return {"test": "Hello, World!"}


@app.post("/ai_analyze")
async def ai_analyze(request: AiServerRequest):
    global emotion_model, tokenizer, vocab
    
    try:
        if emotion_model is None or tokenizer is None or vocab is None:
            return {
                "error": "감정 분석 모델이 로드되지 않았습니다",
                "detail": "서버 시작 시 모델 로드에 실패했습니다"
            }
        
        content = request.content.strip()
        
        if not content:
            return {
                "error": "분석할 내용이 없습니다",
                "detail": "content가 필요합니다"
            }
        
        emotion, confidence, probabilities = predict_emotion(
            emotion_model, content, tokenizer, vocab, max_len
        )
        
        ai_comment = ""
        recommended_food = []
        
        try:
            persona_str = request.persona.value.replace("_", " ")
            
            feedback_input = json.dumps({
                "감정": emotion,
                "일기": content
            }, ensure_ascii=False)
            
            feedback_response = generate_feedback(persona_str, feedback_input)
            
            if feedback_response:
                feedback_text = feedback_response.text.strip()
                
                if "```json" in feedback_text:
                    json_start = feedback_text.find("```json") + 7
                    json_end = feedback_text.find("```", json_start)
                    feedback_text = feedback_text[json_start:json_end].strip()
                elif "```" in feedback_text:
                    json_start = feedback_text.find("```") + 3
                    json_end = feedback_text.find("```", json_start)
                    feedback_text = feedback_text[json_start:json_end].strip()
                
                try:
                    feedback_json = json.loads(feedback_text)
                    ai_comment = feedback_json.get("Action_Advice", "")
                    food_recommendation = feedback_json.get("Food_Recommendation", "")
                    
                    if food_recommendation:
                        if ':' in food_recommendation:
                            parts = food_recommendation.split(':', 1)  
                            food_name = parts[0].strip()
                            reason = parts[1].strip() if len(parts) > 1 else ""
                            recommended_food = [food_name, reason]
                        elif '.' in food_recommendation:
                            parts = [p.strip() for p in food_recommendation.split('.') if p.strip()]
                            if len(parts) >= 2:
                                food_name = parts[0].strip()
                                reason = '. '.join(parts[1:]).strip()
                                recommended_food = [food_name, reason]
                            else:
                                recommended_food = [parts[0].strip(), ""]
                        else:
                            recommended_food = [food_recommendation.strip(), ""]
                    else:
                        recommended_food = ["", ""]
                except json.JSONDecodeError:
                    ai_comment = feedback_text
        except Exception as fb_e:
            print(f"피드백 생성 중 오류: {str(fb_e)}")
            ai_comment = ""
        
        generated_image_base64 = None
        
        try:
            image_data = nano_banana(content, request.sex, request.weather)
            if image_data:
                generated_image_base64 = base64.b64encode(image_data).decode('utf-8')
        except Exception as img_e:
            print(f"이미지 생성 중 오류: {str(img_e)}")
        
        response_data = {
            "aiComment": ai_comment,
            "emotion": emotion,
            "recommendedFood": recommended_food,
            "image": generated_image_base64 if generated_image_base64 else None
        }
        
        return response_data
    
    except Exception as e:
        return {
            "error": "처리 중 오류 발생",
            "detail": str(e)
        }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)