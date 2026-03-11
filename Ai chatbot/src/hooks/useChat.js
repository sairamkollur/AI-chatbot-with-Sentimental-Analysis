import { useState, useEffect } from "react";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // --- 1. Fetch History from Supabase (via FastAPI) on Load ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/history");
        const data = await response.json();
        
        if (data.history && data.history.length > 0) {
          
          // --- PASTE THE CODE HERE ---
          const formattedMessages = data.history.map((msg) => ({
            text: msg.content,
            sender: msg.role, 
            emotion: msg.emotion,
            confidence: msg.confidence, // This ensures the score is pulled from the DB!
          }));
          // ---------------------------

          setMessages(formattedMessages);
          
          setChatHistory([{
            id: "supabase-history",
            title: "Recent Sessions",
            messages: formattedMessages,
            createdAt: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error("Failed to load history from database:", error);
      }
    };

    fetchHistory();
  }, []);

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // --- 2. Send Message to Python Backend ---
  const sendMessage = async (text) => {
    setIsLoading(true);
    
    // Add user message to UI immediately
    const userMessage = { text, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("Backend server error");

      const data = await response.json();

      // Create AI message with the extra emotion data from Python
      const aiMessage = { 
        text: data.reply, 
        sender: "ai",
        emotion: data.emotion,
        confidence: data.confidence 
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Note: We don't need to manually update chatHistory state here
      // because the next time the app loads, it pulls the fresh data 
      // from Supabase through the useEffect above!

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message}. Please check if the Python server is running.`,
          sender: "ai",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (index) => {
    const chat = chatHistory[index];
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chat.id);
    }
  };

  const deleteChat = (index) => {
    // For now, this just clears the local view. 
    // In a real health app, you'd add a DELETE endpoint to FastAPI.
    setChatHistory((prev) => prev.filter((_, i) => i !== index));
    startNewChat();
  };

  const clearAllChats = () => {
    if (window.confirm("This will clear your current view. History remains in the database.")) {
      setMessages([]);
      startNewChat();
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    chatHistory,
    startNewChat,
    loadChat,
    deleteChat,
    clearAllChats,
    currentChatId,
  };
}