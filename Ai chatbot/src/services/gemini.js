export const generateResponse = async (prompt) => {
  try {
    // Send the user's message to your new FastAPI backend
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok) {
      throw new Error(`Backend error! status: ${response.status}`);
    }

    // Parse the JSON response from your Python server
    const data = await response.json();
    
    // Log the new sentiment data to your browser console so you can see it working!
    console.log(`Detected Emotion: ${data.emotion} (Confidence: ${data.confidence})`);

    // We return just the AI's reply string so your existing chat UI doesn't break
    return data.reply; 

  } catch (error) {
    console.error("Backend API Error:", error);
    return "Sorry, I couldn't connect to the backend server. Is Uvicorn running?";
  }
};