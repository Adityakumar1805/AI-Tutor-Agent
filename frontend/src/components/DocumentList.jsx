import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './DocumentList.css';

function DocumentList({ onDocumentsChange, documentsLoading }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      const docs = response.data.documents || [];
      setDocuments(docs);
      if (onDocumentsChange) {
        onDocumentsChange(docs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      if (onDocumentsChange) {
        onDocumentsChange([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/documents/${docId}`);
      const updatedDocuments = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocuments);
      if (onDocumentsChange) {
        onDocumentsChange(updatedDocuments);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="document-list">
        <h2>📚 Your Documents</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <div className="documents-header">
        <h2>📚 Your Documents</h2>
        <button className="refresh-button" onClick={fetchDocuments}>
          🔄 Refresh
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No documents uploaded yet</h3>
          <p>Upload PDF files to get started with intelligent Q&A and quiz generation.</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <h3 className="document-name">{doc.filename}</h3>
                <div className="document-meta">
                  <span>📊 {doc.numChunks} chunks</span>
                  <span>📑 {doc.numPages} pages</span>
                </div>
                <div className="document-date">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                className="delete-button"
                onClick={() => deleteDocument(doc.id)}
                title="Delete document"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentList;
