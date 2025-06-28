import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { getOpenAIChatResponse } from '../services/openAIService';
import { apiCreateLead } from '../services/apiService';
import { WHATSAPP_APPOINTMENT_URL } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: '¡Hola! Soy Kontify, tu asistente fiscal. Para empezar, ¿me podrías decir cuál es tu duda o consulta principal?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  
  // Lead info is captured implicitly by the conversation history
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading || isConversationEnded) return;

    const userMessage: ChatMessage = { sender: 'user', text: input, timestamp: Date.now() };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    const currentCount = userMessageCount + 1;
    setUserMessageCount(currentCount);

    let botResponseText: string | React.ReactNode;

    if (currentCount >= 3) {
      // End of conversation flow
      setIsConversationEnded(true);
      
      // Implicit lead creation from conversation
      const conversationText = newMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
      // A more sophisticated approach would be to parse name/email, but for now we send the whole chat.
      apiCreateLead({ name: "Cliente de Chatbot", email: "a-definir@chatbot.com", query_details: conversationText });
      
      botResponseText = (
          <div className="space-y-3">
              <p>¡Gracias por tu información! He registrado tu consulta.</p>
              <p>Para darte una asesoría completa y personalizada, el siguiente paso es agendar una breve llamada con nuestro equipo. Haz clic aquí:</p>
              <a 
                  href={WHATSAPP_APPOINTMENT_URL}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
              >
                  Agendar Cita por WhatsApp
              </a>
          </div>
      );
      const botMessage: ChatMessage = { sender: 'bot', text: botResponseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMessage]);

    } else {
      // Continue conversation with AI
      try {
        // Filter out non-string messages (like the WhatsApp button) before sending to AI
        const historyForAI = newMessages
          .slice(1) // remove initial bot message
          .filter(msg => typeof msg.text === 'string') // only include text messages for the AI
          .map(msg => ({
            role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.text as string,
        }));
        botResponseText = await getOpenAIChatResponse(historyForAI);
      } catch (error) {
        botResponseText = 'Lo siento, algo salió mal.';
      }
      const botMessage: ChatMessage = { sender: 'bot', text: botResponseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMessage]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col h-[60vh]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-7 h-7 text-indigo-500" />
        </div>
        <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Asistente Fiscal IA</h3>
            <p className="text-sm text-green-500 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                En línea
            </p>
        </div>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={`${msg.timestamp}-${index}`} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-indigo-500"/>
              </div>
            )}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              <div className="text-sm">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-5 h-5 text-indigo-500"/>
                </div>
                 <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <SpinnerIcon className="w-4 h-4" />
                        <span className="text-sm italic">Kontify está escribiendo...</span>
                    </div>
                </div>
            </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isConversationEnded ? "Conversación finalizada." : "Escribe tu mensaje..."}
            className="flex-1 bg-transparent p-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            disabled={isLoading || isConversationEnded}
          />
          <button onClick={handleSend} disabled={isLoading || input.trim() === '' || isConversationEnded} className="p-3 text-indigo-500 disabled:text-gray-400 dark:disabled:text-gray-500 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;