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
    keywords = ["sağlık", "finans", "eğitim", "enerji", "oyun", "yazılım", "tarım", "sigorta", "yapay zeka", "karbon", "kredi", "ödeme", "bankacılık", "fintech"]
    question_lower = question.lower()
    matched_sector = next((k for k in keywords if k in question_lower), None)

    if matched_sector:
        related_words = {
            "kredi": ["kredi", "ödeme", "borç", "finansman", "taksit", "bankacılık", "fintech", "finans"],
            "finans": ["finans", "ekonomi", "para", "gelir", "ödeme"]
        }
        extra_keywords = related_words.get(matched_sector, [matched_sector])
        filtered_df = df[df['description'].apply(lambda desc: any(word in str(desc).lower() for word in extra_keywords))]
    else:
        words = question_lower.split()
        filtered_df = df[df['description'].apply(lambda desc: any(word in str(desc).lower() for word in words))]

    return filtered_df, matched_sector


@app.post("/ask")
async def ask_question(input: QuestionInput):
    question = input.question
    filtered_df, matched_sector = filter_relevant_startups(question)

    if filtered_df.empty:
        return JSONResponse(
            content={
                "answer": f"Üzgünüm, '{matched_sector or question}' için uygun startup çözümüne ulaşamadım. Dilerseniz farklı çözümler için yardımcı olabilirim."
            }
        )

    # Verilen cevabın içinde gerçekten listedeki startup isimleri var mı?
    def has_valid_startup_name(answer_text, startup_names):
        return any(name.lower() in answer_text.lower() for name in startup_names if isinstance(name, str))

    batch_size = 20
    for i in range(0, len(filtered_df), batch_size):
        batch_df = filtered_df.iloc[i:i + batch_size]
        context = batch_df[['startupName', 'description', 'WebsiteLink']].to_string(index=False)

        prompt = f"""
        Kullanıcının ihtiyacı: "{question}"

        Aşağıda sadece startup veri setine ait bilgiler verilmiştir.
        Sadece bu listedeki startup'lara dayalı cevap ver.
        Listedeki startup'lar dışındaki kaynaklardan ÖNERİ VERME!

        Her bir startup için:
        - Açıklama
        - Web sitesi (varsa)

        STARTUP VERİ SETİ:
        {context}
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )

        raw_answer = response.choices[0].message.content
        answer = raw_answer.strip() if raw_answer else ""

        if has_valid_startup_name(answer, batch_df['startupName'].tolist()):
            return JSONResponse(content={"answer": answer})

    # Eğer hiçbir parçada uygun çözüm çıkmazsa
    return JSONResponse(
        content={
            "answer": f"Üzgünüm, '{matched_sector or question}' için uygun startup çözümüne ulaşamadım. Dilerseniz farklı çözümler için yardımcı olabilirim."
        }
    )
