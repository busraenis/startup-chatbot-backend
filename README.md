# startup-chatbot-backend
Startup araştırması için yaptığımız chatbot 

# Meet-in-One Startup Öneri Chatbotu

Bu proje, Kuveyt Türk için geliştirilmiş bir **startup çözüm öneri chatbotudur**. Kullanıcıların yazdığı ihtiyaçlara göre en uygun startup çözümlerini veritabanından çekerek OpenAI GPT destekli cevaplar üretir.

# Özellikler

- Kullanıcının girişte karşılama mesajı ile karşılanması
- Sektör kelimesine göre filtrelenmiş startup önerileri
- Birden fazla öneriyi mesaj balonu şeklinde gösterme
- Website linklerinin sadece "Website:" kelimesinden sonra tıklanabilir olması
- Selam, nasılsın gibi günlük mesajlara da cevap verebilme
- Replit veya Render gibi platformlarda çalışabilir

# Teknolojiler

- `React` (Frontend)
- `FastAPI` + `OpenAI SDK` (Backend)
- `CSV` tabanlı veri
- `Replit` veya `Render` üzerinden deploy edilebilir

# Kurulum

# Frontend
```bash
cd startup-chatbot-ui
npm install
npm start
