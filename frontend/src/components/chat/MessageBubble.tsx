import { User as UserIcon } from "lucide-react";
import Image from "next/image";

interface MessageBubbleProps {
  role: string;
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
          isUser ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
        }`}
      >
        {isUser ? (
          <UserIcon size={16} />
        ) : (
          <Image 
            src="/bot-icon.webp" 
            alt="Bot" 
            width={32} 
            height={32} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div
        className={`p-3 rounded-lg max-w-[80%] ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
