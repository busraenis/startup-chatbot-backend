


from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.responses import JSONResponse
import os

# .env içindeki API key'i yükle
load_dotenv()

# OpenAI istemcisini başlat
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    organization=os.getenv("OPENAI_ORG_ID"),
    project=os.getenv("OPENAI_PROJECT_ID")
)
# FastAPI başlat
app = FastAPI()

# CSV dosyasını yükle
df = pd.read_csv("Fixed_Cleaned_Start-up_databasee.csv")

# API'ye gelecek input modeli
class QuestionInput(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(input: QuestionInput):
    question = input.question

    # İlk 20 girişten bağlam oluştur
    context = df[['startupName', 'description', 'WebsiteLink']].head(20).to_string(index=False)

    prompt = f"""
Kullanıcı bir çözüm arıyor: {question}
Aşağıdaki startup veri setine göre en uygun çözümü öner. Açıklama ve web sitesini de ver.

{context}
"""

    # GPT'den yanıt al
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return JSONResponse(content={"answer": response.choices[0].message.content})
