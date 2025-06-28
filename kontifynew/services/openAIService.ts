// This service handles interactions with the backend for the public-facing chatbot.
import { apiGetOpenAIChatResponse } from './apiService';

type OpenAIChatHistory = {
    role: 'user' | 'assistant';
    content: string;
}[];

export const getOpenAIChatResponse = async (history: OpenAIChatHistory): Promise<string> => {
    // All logic is now on the backend. The frontend just passes the history.
    // The backend is responsible for the system prompt, API key, and calling OpenAI.
    const reply = await apiGetOpenAIChatResponse(history);
    
    // The apiService might return null or an error message string. We provide a fallback.
    return reply || "Lo siento, ocurrió un error al procesar tu solicitud.";
};