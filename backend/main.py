from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from transformers import pipeline
from supabase import create_client, Client

# --- Data Visualization Imports ---
import matplotlib.pyplot as plt
import io
import base64
from collections import Counter

# 1. Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 2. Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 3. Configure Gemini AI
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

# 4. Load the Local Emotion Detection Model
print("Loading Emotion Detection Model... Please wait.")
emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
print("Model Loaded Successfully!")

app = FastAPI(title="AI Health Chatbot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "Backend server is running!"}

# --- 1. CHAT ENDPOINT ---
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # Step A: Run Emotion Analysis
        emotion_data = emotion_classifier(request.message)[0][0]
        detected_emotion = emotion_data['label'].capitalize()
        confidence_score = round(emotion_data['score'] * 100, 2)
        
        # DATABASE WRITE 1: Save User Message
        supabase.table("messages").insert({
            "role": "user",
            "content": request.message,
            "emotion": detected_emotion,
            "confidence": f"{confidence_score}%"
        }).execute()
        
        # Step B: Generate Gemini Response with INDIA-SPECIFIC SAFETY
        system_context = (
            f"You are a supportive mental health chatbot for users in India. "
            f"The user is currently expressing {detected_emotion}. "
            "IMPORTANT: If the user mentions self-harm, injury, or emergency, "
            "provide India-specific resources: Call 102 for Ambulance, 100 for Police, "
            "or Vandrevala Foundation at 9999 666 555. "
            "Respond empathetically and concisely to this message: "
        )
        
        full_prompt = system_context + request.message
        response = gemini_model.generate_content(full_prompt)
        
        # DATABASE WRITE 2: Save AI Response
        supabase.table("messages").insert({
            "role": "ai",
            "content": response.text,
            "emotion": "Neutral",
            "confidence": "N/A" # Keeps history clean after refresh
        }).execute()
        
        return {
            "reply": response.text,
            "emotion": detected_emotion,
            "confidence": f"{confidence_score}%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. HISTORY ENDPOINT ---
@app.get("/history")
async def get_chat_history():
    try:
        response = supabase.table("messages").select("*").order("created_at", desc=False).execute()
        return {"history": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. DASHBOARD ENDPOINT (Matplotlib) ---
@app.get("/dashboard")
async def get_mood_dashboard():
    try:
        # Fetch only user emotions from Supabase
        response = supabase.table("messages").select("emotion").eq("role", "user").execute()
        emotions = [msg['emotion'] for msg in response.data if msg['emotion']]

        if not emotions:
            return {"image": None, "message": "No data found"}

        # Count emotions for the bar chart
        counts = Counter(emotions)
        labels = list(counts.keys())
        values = list(counts.values())

        # Create the Plot
        plt.figure(figsize=(8, 5))
        # Professional Indigo/Emerald color palette
        colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        plt.bar(labels, values, color=colors[:len(labels)])
        plt.title("Detected Emotion Frequency")
        plt.xlabel("Emotion")
        plt.ylabel("Count")

        # Save plot to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()

        return {"image": img_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))