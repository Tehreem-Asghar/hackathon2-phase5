import { api } from "./api";

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ToolCall {
  tool: string;
  args: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  tool_calls?: ToolCall[];
}

export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.fetch("/api/chat/", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to send message");
    }

    return response.json();
  },
};