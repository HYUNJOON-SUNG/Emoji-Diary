from fastapi import FastAPI
from pydantic import BaseModel
import base64
import os

app = FastAPI()

@app.post("/ai/test")
def read_root(data: dict):
    print(f"[FastAPI] Spring Boot로부터 받은 데이터: {data}")
    
    # 간단한 응답 반환
    return {
        "status": "success",
        "message": "FastAPI 서버가 데이터를 잘 받았습니다!",
        "received_data": data
    }

@app.post("/api/ai/diary")
def analyze_diary(data: dict):
    print(f"[FastAPI] 일기 분석 요청 (Full Data): {data}")
    
    # 이미지 읽기 및 Base64 인코딩
    image_path = "예시 이미지.jpg"
    encoded_string = ""
    
    if os.path.exists(image_path):
        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"Error reading image: {e}")
    else:
        print(f"Error: {image_path} not found.")

    return {
        "aiComment": "ai가 생성할 코멘트",
        "emotion": "행복",
        "recommendedFood": ["ai가 추천할 음식", "추천하는 이유"],
        "image": encoded_string
    }

# 실행 방법 (터미널에서 ai-server 폴더로 이동 후):
# pip install fastapi uvicorn
# uvicorn main:app --reload --port 8000