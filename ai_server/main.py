from fastapi import FastAPI
from pydantic import BaseModel

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

# 실행 방법 (터미널에서 ai-server 폴더로 이동 후):
# pip install fastapi uvicorn
# uvicorn main:app --reload --port 8000