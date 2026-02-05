"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import { chatApi } from "@/lib/chat-api";
import { MessageBubble } from "./MessageBubble";

interface ChatInterfaceProps {
  onUpdate?: () => void;
}

export function ChatInterface({ onUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const data = await chatApi.sendMessage({ message: userMsg }); 
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      if (onUpdate) onUpdate(); // Refresh parent data
    } catch (error: any) {
      let errorMessage = error.message || "Sorry, I encountered an error.";
      
      // Handle Rate Limiting (Quota Exceeded)
      if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded")) {
        // Suppress console error for expected rate limits
        errorMessage = "⚠️ AI Usage Limit Reached. Please wait a moment and try again.";
      } 
      else if (errorMessage.includes("Agent error:")) {
        // Log genuine agent errors but handle gracefully in UI
        console.error("Agent Error:", error);
        errorMessage = "I'm having trouble processing that right now. Please try again.";
      } else {
        // Log unexpected errors
        console.error("Chat Error:", error);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 pb-10">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-white rounded-lg border shadow-sm">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border border-gray-200">
              <Image 
                src="/bot-icon.webp" 
                alt="Bot" 
                width={64} 
                height={64} 
                className="w-full h-full object-cover"
              />
            </div>
            <p>Start a conversation with your Todo Assistant!</p>
            <p className="text-sm">Try "Add a task to buy milk" or "What tasks do I have?"</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        
        {loading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
               <Image 
                 src="/bot-icon.webp" 
                 alt="Bot" 
                 width={32} 
                 height={32} 
                 className="w-full h-full object-cover"
               />
             </div>
             <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
               <span className="animate-pulse">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-slate-800"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-700 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
