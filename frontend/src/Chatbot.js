import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Air Quality Assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply || "I couldn't understand that." }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server. Please check if the ML API is running on port 5000.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>🤖 AQI Assistant</h3>
            <button className="close-btn" onClick={toggleChat}>✕</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className="message">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="message typing-indicator">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
        title="Chat with AI Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;
