"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { chatApi } from "@/lib/chat-api";
import { useAuth } from "@/lib/auth";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // We are building a custom chat loop because standard useChat from 'ai/react'
  // typically expects a Vercel AI SDK compatible stream endpoint.
  // Our backend returns a JSON response (stateless req/res).
  // So we manage state manually or write a custom fetcher.
  // Here we manage manually to match the ChatResponse schema.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // In a real implementation, we might store conversation_id in URL or state
      // For now we rely on backend finding latest or creating new
      // We pass undefined for conversation_id to let backend handle it or create new
      const data = await chatApi.sendMessage({ message: userMsg }); 
      
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      console.error(error);
      // Clean up the error message if it comes from the backend wrapper
      let errorMessage = error.message || "Sorry, I encountered an error.";
      if (errorMessage.includes("Agent error:")) {
        // Extract helpful part if possible, otherwise show full
        if (errorMessage.includes("429")) {
           errorMessage = "Rate limit exceeded (Quota full). Please wait a minute and try again.";
        } else {
           errorMessage = errorMessage.replace("Agent error: ", "");
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-white rounded-lg border shadow-sm">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start a conversation with your Todo Assistant!</p>
            <p className="text-sm">Try "Add a task to buy milk" or "What tasks do I have?"</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}
            >
              {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
               <span className="animate-pulse">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
