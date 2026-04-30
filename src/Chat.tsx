import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, ArrowLeft } from 'lucide-react';
import OpenAI from 'openai';
import './Chat.css';
import ParticleBackground from './ParticleBackground';

interface ChatProps {
  onBack?: () => void;
}

// 👇 EDIT PREDEFINED PROMPTS HERE 👇
const PROMPT_SUGGESTIONS = [
  {
    title: "About Dashbirds 🐦",
    prompt: "Can you tell me a little bit about Dashbirds?"
  },
  {
    title: "Who is Eduardo Bonfim? 🥸",
    prompt: "Who is Eduardo Bonfim?"
  },
  {
    title: "Get in touch 📧",
    prompt: "What are the available contact channels?"
  },
  {
    title: "Services 📂",
    prompt: "What services does Dashbirds offer?"
  }
];
// 👆 EDIT PREDEFINED PROMPTS HERE 👆

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Initialize OpenAI client
// In production, this should be done on the backend to avoid exposing the key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allows running client-side for development
});

export default function Chat({ onBack }: ChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare chat history for the API (could limit messages to save tokens, sending all for now)
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      chatHistory.push({ role: 'user', content: userText });

      const stream = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful virtual assistant.' },
          ...chatHistory
        ],
        model: 'gpt-3.5-turbo', // You can change to 'gpt-4o' if preferred
        stream: true,
      });

      const botMsgId = (Date.now() + 1).toString();
      
      // Add an empty bot message and remove the "Thinking..." state
      setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '' }]);
      setIsLoading(false);

      let currentContent = '';
      
      // Iterate over the stream and append text chunks (tokens) as they arrive
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          currentContent += text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId ? { ...msg, content: currentContent } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Error message in case the API fails (e.g., invalid key)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'An error occurred while communicating with OpenAI. Please check if your API key (VITE_OPENAI_API_KEY) is configured correctly in the .env file.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    setInput(e.target.value);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
  };

  const isChatEmpty = messages.length === 0;

  return (
    <div className="layout">
      <ParticleBackground />
      
      {/* Back to Landing Button */}
      {onBack && (
        <button className="back-to-landing" onClick={onBack} title="Go back">
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Main Chat Area */}
      <div className="main-content">
        {/* Header - Only visible when there are messages */}
        {!isChatEmpty && (
          <header className="chat-header">
            <button className="header-brand-title" onClick={resetChat}>
              Dashbirds
            </button>
          </header>
        )}

        {/* Messages */}
        <div className={`messages-container ${isChatEmpty ? 'empty' : ''}`}>
          {isChatEmpty ? (
            <div className="empty-state">
              <h1 className="brand-title">Dashbirds</h1>
              <p className="brand-subtitle">In data we trust, in marketing we believe</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                  <div className="message">
                    <div className="avatar">
                      {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="message-wrapper assistant">
                  <div className="message">
                    <div className="avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content loading-content">
                      <Loader2 className="loading-spinner" size={20} />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`input-area ${isChatEmpty ? 'centered' : 'bottom'}`}>
          <div className="input-container">
            {isChatEmpty && (
              <div className="prompt-suggestions">
                {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-box"
                    onClick={() => sendMessage(suggestion.prompt)}
                    disabled={isLoading}
                  >
                    <span className="suggestion-title">{suggestion.title}</span>
                    <span className="suggestion-prompt">{suggestion.prompt}</span>
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="input-form">
              <textarea
                value={input}
                onChange={autoResize}
                onKeyDown={handleKeyDown}
                placeholder="Message Dashbirds..."
                rows={1}
                className="chat-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className={`send-button ${input.trim() && !isLoading ? 'active' : ''}`}
                disabled={!input.trim() || isLoading}
              >
                <Send size={16} />
              </button>
            </form>
            <div className="input-footer">
              Dashbirds can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
