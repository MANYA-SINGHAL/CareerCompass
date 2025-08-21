// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "alex", text: "👋 Hi! I’m Alex, your Study Buddy. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const USER_ID = "demo-user"; // replace with actual logged-in user id
  const API_BASE = "http://localhost:5050/api"; // backend URL

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Poll backend for proactive messages every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/checkin/${USER_ID}`);
        const data = await res.json();

        if (data.message) {
          setMessages(prev => [...prev, { sender: "alex", text: data.message }]);
        }
      } catch (err) {
        console.error("Check-in polling error:", err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message instantly
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId: USER_ID })
      });

      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "alex", text: data.response }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "alex", text: "⚠️ Oops, something went wrong! 😅" }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div
          className="w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col border border-gray-200 animate-[slideUp_0.3s_ease-out]"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold">Alex - Study Buddy</span>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg hover:text-gray-200">✖</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-[75%] text-sm shadow ${
                    msg.sender === "user"
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg rounded-bl-none animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex space-x-2 bg-white">
            <input
              type="text"
              value={input}
              placeholder="Type a message..."
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg text-xl transition-transform transform hover:scale-105"
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}
    </div>
  );
}
