import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ChatUI from './components/ChatUI';
import FileUpload from './components/FileUpload';
import QuizUI from './components/QuizUI';
import DocumentList from './components/DocumentList';
import API_URL from './config';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🎓 AI Tutor Agent</h1>
          <p className="subtitle">Your Intelligent Learning Assistant</p>
        </div>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={activeTab === 'quiz' ? 'active' : ''}
            onClick={() => setActiveTab('quiz')}
          >
            📝 Quiz
          </button>
          <button
            className={activeTab === 'documents' ? 'active' : ''}
            onClick={() => setActiveTab('documents')}
          >
            📚 Documents
          </button>
        </nav>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </aside>

        <section className="main-content">
          {activeTab === 'chat' && <ChatUI documents={documents} />}
          {activeTab === 'quiz' && <QuizUI documents={documents} />}
          {activeTab === 'documents' && (
            <DocumentList 
              onDocumentsChange={setDocuments} 
              documentsLoading={documentsLoading}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>✨ Powered by Vertex AI & RAG Technology</p>
      </footer>
    </div>
  );
}

export default App;