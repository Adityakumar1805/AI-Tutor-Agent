import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setStatus('⚠️ Only PDF files are allowed');
        return;
      }
      setFile(selectedFile);
      setStatus(`Selected: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('⚠️ Please select a PDF file first');
      return;
    }

    setUploading(true);
    setStatus('📤 Uploading and processing...');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      setStatus(`✅ Success! ${response.data.chunks} chunks indexed from ${response.data.pages} pages`);
      setFile(null);
      
      // Reset file input
      document.querySelector('#file-input').value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => {
        setStatus('');
        setProgress(0);
      }, 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`❌ Error: ${error.response?.data?.error || error.message}`);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h3>📚 Upload Study Material</h3>
      <p className="upload-description">
        Upload PDF files with your study materials. The AI will process and index them for intelligent responses.
      </p>

      <div className="upload-area">
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {file ? (
            <span className="file-name">📄 {file.name}</span>
          ) : (
            <>
              <span className="upload-icon">📁</span>
              <span>Choose PDF File</span>
            </>
          )}
        </label>
      </div>

      {file && (
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? '⏳ Processing...' : '🚀 Upload & Process'}
        </button>
      )}

      {uploading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {status && (
        <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
          {status}
        </div>
      )}

      <div className="upload-info">
        <p><strong>How it works:</strong></p>
        <ol>
          <li>Upload your PDF study material</li>
          <li>AI processes and chunks the content</li>
          <li>Creates embeddings for semantic search</li>
          <li>Ready for intelligent Q&A!</li>
        </ol>
      </div>
    </div>
  );
}

export default FileUpload;