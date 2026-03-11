import { useState } from "react";
import useChat from "./hooks/useChat";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Header from "./components/Header";
import HistorySidebar from "./components/HistorySidebar";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState("chat");

  const {
    messages,
    isLoading,
    sendMessage,
    chatHistory,
    startNewChat,
    loadChat,
    deleteChat,
    clearAllChats,
    currentChatId,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={() => {
          setView("chat");
          startNewChat();
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <HistorySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          chatHistory={chatHistory}
          onSelectChat={(index) => {
            setView("chat");
            loadChat(index);
            setSidebarOpen(false);
          }}
          onDeleteChat={deleteChat}
          onClearAll={clearAllChats}
          currentChatId={currentChatId}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          
          {/* Navigation Toggle Buttons */}
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setView("chat")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'chat' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              Chat
            </button>
            <button 
              onClick={() => setView("dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              Health Dashboard
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4">
            {view === "dashboard" ? (
              <Dashboard /> 
            ) : (
              <div className="flex flex-col h-full">
                
                {/* --- 🚨 CRISIS ALERT LOGIC --- */}
                {messages.length > 0 && 
                  (messages[messages.length - 1].emotion === "Sadness" || 
                   messages[messages.length - 1].emotion === "Anger") && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm animate-pulse">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-red-500 font-bold">🚨 Help is available:</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          It looks like you're going through a tough time. Please call the 
                          <strong> Vandrevala Foundation (India)</strong> at 
                          <span className="font-bold"> 9999 666 555</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                      <h2 className="text-xl font-semibold mb-2">SMEC Health Care Chatbot</h2>
                      <p className="text-gray-600">Start a new chat or select one from your history</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <Message
                      key={index}
                      sender={msg.sender}
                      text={msg.text}
                      isError={msg.isError}
                      emotion={msg.emotion}
                      confidence={msg.confidence}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Only show input area when in chat view */}
          {view === "chat" && (
            <InputArea onSend={sendMessage} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}