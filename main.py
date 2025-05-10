from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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

# CORS middleware ekle (frontend bağlantısı için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CSV dosyasını yükle
df = pd.read_csv("Start-up-database.csv")

# API'ye gelecek input modeli
class QuestionInput(BaseModel):
    question: str

# Kullanıcının sorusuna göre sektörel filtreleme yapar
def filter_relevant_startups(question: str):
    keywords = ["sağlık", "finans", "eğitim", "enerji", "oyun", "yazılım", "tarım", "sigorta", "yapay zeka", "karbon"]
    matched_sector = next((k for k in keywords if k in question.lower()), None)

    if matched_sector:
        filtered_df = df[df['description'].str.contains(matched_sector, case=False, na=False)]
    else:
        filtered_df = df  # eşleşme yoksa tüm dataset'i kullan

    return filtered_df

@app.post("/ask")
async def ask_question(input: QuestionInput):
    question = input.question

    # Sektöre göre startup filtreleme
    filtered_df = filter_relevant_startups(question)

    # İlk 5 uygun startup'ı bağlam olarak al
    context = filtered_df[['startupName', 'description', 'WebsiteLink']].head(5).to_string(index=False)

    prompt = f"""
Kullanıcı bir çözüm arıyor: {question}
Aşağıdaki startup veri setine göre birden fazla uygun çözüm öner. Her startup için açıklama ve web sitesini belirt.

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
    print("GPT cevabı:", response.choices[0].message.content)
    return JSONResponse(content={"answer": response.choices[0].message.content})

