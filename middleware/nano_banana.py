import os
from io import BytesIO
from google import genai
from google.genai import types

from server.template.prompt import Prompt

prompt = Prompt()

# 추후 환경변수로 관리
api_key = "REDACTED_API_KEY"

def nano_banana(diary_content, sex):
    system_prompt = prompt.nano_banana
    
    client = genai.Client(api_key=api_key)
    
    full_prompt = f"{system_prompt}\n\n성별: \"{sex}\"\n\n일기 내용: \"{diary_content}\""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[full_prompt],
            config=types.GenerateContentConfig(
                response_modalities=['Image'],
                system_instruction=system_prompt
            )
        )
        
        if response.candidates and len(response.candidates) > 0:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data is not None:
                    return part.inline_data.data
        
        print("응답에 이미지 데이터가 없습니다.")
        return None
        
    except Exception as e:
        print(f"이미지 생성 중 오류 발생: {str(e)}")
        return None