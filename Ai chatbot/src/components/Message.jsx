import { FaUser, FaRobot } from "react-icons/fa";

// Destructure the new emotion and confidence props
export default function Message({ sender, text, emotion, confidence, isError }) {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
        
        {/* Avatar Section */}
        <div className="mx-2 mt-1">
          {isUser ? (
            <FaUser className="text-blue-500 text-lg" />
          ) : (
            <FaRobot className={`text-lg ${isError ? "text-red-500" : "text-emerald-500"}`} />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`p-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : isError
              ? "bg-red-100 text-red-800 rounded-bl-none border border-red-200"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>

          {/* --- NEW EMOTION BADGE LOGIC START --- */}
          {!isUser && emotion && confidence !== "N/A" && !isError && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                User Mood: {emotion}
              </span>
              <span className="text-[10px] text-gray-400 italic">
                Accuracy: {confidence}
              </span>
            </div>
          )}
          {/* --- NEW EMOTION BADGE LOGIC END --- */}
          
        </div>
      </div>
    </div>
  );
}