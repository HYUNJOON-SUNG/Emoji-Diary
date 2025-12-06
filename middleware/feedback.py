import google.generativeai as genai

from server.template.prompt import Prompt

prompt = Prompt()

# 추후 환경변수로 관리
api_key = "REDACTED_API_KEY"
genai.configure(api_key=api_key)

def choice_persona(persona_list):
    if persona_list == "BEST FRIEND":
        return prompt.BEST_FRIEND_PROMPT
    elif persona_list == "PARENTS":
        return prompt.PARENTS
    elif persona_list == "EXPERT":
        return prompt.EXPERT
    elif persona_list == "MENTOR":
        return prompt.MENTOR
    elif persona_list == "COUNSELOR":
        return prompt.COUNSELOR
    elif persona_list == "POET":
        return prompt.POET
    else :
        return "INVALID PERSONA"

def generate_feedback(persona, content):

    system_prompt = choice_persona(persona)

    if system_prompt == "INVALID PERSONA":
        print("INVALID PERSONA")
        return None

    model_with_system = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=system_prompt
    )
    
    response = model_with_system.generate_content(content)
    
    return response