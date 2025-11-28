import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './ChatUI.css';

function ChatUI({ documents }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! 👋 I'm your AI Tutor Agent. Upload your study materials and ask me questions!",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        userId: 'user',
        message: input,
        docId: selectedDocId
      });

      const assistantMessage = {
        sender: 'assistant',
        text: response.data.reply,
        sources: response.data.sources || [],
        usedRAG: response.data.usedRAG
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-ui">
      <div className="chat-header">
        <h2>💬 Chat with AI Tutor</h2>
        {documents.length > 0 && (
          <select
            className="doc-selector"
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value || null)}
          >
            <option value="">All Documents</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.filename}</option>
            ))}
          </select>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="message-sources">
                  <strong>📚 Sources:</strong>
                  {msg.sources.map((source, i) => (
                    <div key={i} className="source-item">
                      <span className="similarity">{(source.similarity * 100).toFixed(1)}% match</span>
                      <p>{source.text}</p>
                      {source.filename && <small>From: {source.filename}</small>}
                    </div>
                  ))}
                </div>
              )}

              {msg.usedRAG && (
                <div className="rag-indicator">✨ Using RAG (Retrieval-Augmented Generation)</div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder="Ask a question about your study materials..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '🚀'}
        </button>
      </div>
    </div>
  );
}

export default ChatUI;