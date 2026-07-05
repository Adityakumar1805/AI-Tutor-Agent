# 🎓 AI Tutor Agent

An intelligent, personalized learning assistant built using **Google Vertex AI**, **RAG (Retrieval-Augmented Generation)**, **React**, and **Node.js**. This project helps students learn faster by providing step-by-step explanations, personalized quizzes, and intelligent Q&A based on uploaded study materials.

---

## ✨ Features

### 🤖 Core Features
- **📚 Document Upload & Processing**: Upload PDF study materials with automatic chunking and indexing
- **💬 Intelligent Chat Interface**: Ask questions and get answers grounded in your uploaded materials using RAG
- **📝 Quiz Generation**: Create personalized quizzes from your study materials with auto-grading
- **🔍 Semantic Search**: Find relevant information across all uploaded documents
- **📊 Document Management**: View, manage, and delete uploaded documents

### 🎯 Key Capabilities
- **RAG-Powered Responses**: Answers are based on your actual study materials with source citations
- **Context-Aware**: Maintains conversation context and document-specific filtering
- **Fallback Mode**: Works without Vertex AI credentials using intelligent local processing
- **Real-time Processing**: Fast PDF processing and instant responses

---

## 🏗️ Architecture

```
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Express   │
│   Backend   │
└──────┬──────┘
       │
       ├──► Vector Store (In-Memory)
       │
       ├──► Vertex AI (Optional)
       │    ├── Gemini Models
       │    └── Embeddings API
       │
       └──► Firebase (Optional)
            └── Firestore
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Axios** - HTTP client for API calls
- **CSS3** - Styled components with modern design

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **UUID** - Unique identifier generation

### AI & Services (Optional)
- **Google Vertex AI** - Gemini models for chat and quiz generation
- **Vertex AI Embeddings** - Text embeddings for semantic search
- **Firebase Admin** - Optional database and storage

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

**Optional (for full Vertex AI features):**
- Google Cloud Project with Vertex AI API enabled
- Service account credentials JSON file
- Firebase project (optional)

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Adityakumar1805/ai-tutor-agent.git
cd ai-tutor-agent
```

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4️⃣ Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# CORS Configuration (for local development)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Optional: Google Cloud / Vertex AI Configuration
# GOOGLE_CLOUD_PROJECT_ID=your-project-id
# GOOGLE_CLOUD_REGION=us-central1
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
# VERTEX_AI_MODEL=gemini-1.5-flash-001
# VERTEX_AI_EMBEDDING_MODEL=textembedding-gecko@003

# Optional: Firebase Configuration
# FIREBASE_PROJECT_ID=your-firebase-project-id
# GCS_BUCKET_NAME=your-gcs-bucket-name
```

#### Frontend Configuration

Create `frontend/.env` file:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080

# Optional: Firebase Configuration (if using Firebase features)
# REACT_APP_FIREBASE_API_KEY=your-api-key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
# REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 5️⃣ Start the Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:8080`

You should see:
```
🚀 AI Tutor Agent Backend
==================================================
📍 Server running on http://localhost:8080
🤖 Vertex AI: ⚠️  Fallback Mode
📚 Vector Store: 0 documents
🔥 Firebase: ⚠️  Not configured
==================================================
```

### 6️⃣ Start the Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

---

## 📖 Usage Guide

### Uploading Documents

1. Click on the **📚 Upload Study Material** section in the sidebar
2. Click "Choose PDF File" and select your PDF document
3. Click "🚀 Upload & Process"
4. Wait for processing (the AI will chunk and index your document)

### Chatting with AI Tutor

1. Go to the **💬 Chat** tab
2. Type your question in the input field
3. Press Enter or click the send button
4. The AI will search your uploaded documents and provide an answer with sources

**Tips:**
- Upload documents before asking questions for best results
- You can filter by specific document using the dropdown
- Questions are answered based on your uploaded materials

### Generating Quizzes

1. Go to the **📝 Quiz** tab
2. Enter a topic (e.g., "Arrays", "Trigonometry")
3. Select the number of questions (3, 5, or 10)
4. Optionally select a specific document
5. Click "🎯 Generate Quiz"
6. Answer the questions and click "📤 Submit Quiz" to see your score

### Managing Documents

1. Go to the **📚 Documents** tab
2. View all uploaded documents with metadata
3. Click the 🗑️ button to delete a document
4. Click "🔄 Refresh" to reload the list

---

## 🔧 Configuration Options

### Enable Vertex AI (Production)

For production-grade AI responses, configure Vertex AI:

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Vertex AI API

2. **Create Service Account:**
   - Go to IAM & Admin → Service Accounts
   - Create a new service account
   - Grant "Vertex AI User" role
   - Download JSON key file

3. **Update `.env`:**
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_REGION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
   VERTEX_AI_MODEL=gemini-1.5-flash-001
   VERTEX_AI_EMBEDDING_MODEL=textembedding-gecko@003
   ```

4. **Restart the backend server**

### Enable Firebase (Optional)

For persistent storage and database:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Get your Firebase config
3. Update environment variables (see `.env.example` files)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend won't start
- Check if port 8080 is already in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and is properly formatted

**Problem:** PDF upload fails
- Ensure the file is a valid PDF
- Check file size (max 50MB)
- Verify `backend/uploads` directory exists

**Problem:** CORS errors
- Update `CORS_ORIGIN` in `backend/.env` to include your frontend URL
- Ensure backend is running before starting frontend

### Frontend Issues

**Problem:** Can't connect to backend
- Verify backend is running on `http://localhost:8080`
- Check `REACT_APP_API_URL` in `frontend/.env`
- Test backend health: Open `http://localhost:8080/health` in browser

**Problem:** Build fails
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 16+)

### Vertex AI Issues

**Problem:** "Vertex AI not configured" warning
- This is normal! The app works in fallback mode
- To enable Vertex AI, follow the configuration steps above
- Verify your service account JSON path is correct

---

## 📁 Project Structure

```
ai-tutor-agent/
├── backend/
│   ├── server.js           # Main Express server
│   ├── aiService.js        # Vertex AI integration
│   ├── vectorStore.js      # In-memory vector database
│   ├── uploads/            # PDF upload directory
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── components/
│   │   │   ├── ChatUI.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── QuizUI.jsx
│   │   │   └── DocumentList.jsx
│   │   ├── config.js       # API configuration
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── README.md               # This file
├── DEPLOYMENT.md          # Deployment guide
├── docker-compose.yml     # Docker setup
├── vercel.json            # Vercel config
├── render.yaml            # Render config
└── railway.json           # Railway config
```

---

## 🚢 Deployment

This project can be deployed to various platforms:

- **Frontend:** Vercel, Netlify, Firebase Hosting
- **Backend:** Render, Railway, Google Cloud Run, Heroku

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Links

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🌐 [Deploy to Vercel](https://vercel.com)
- 🔧 [Deploy to Render](https://render.com)
- 🚂 [Deploy to Railway](https://railway.app)

---

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns server status and statistics.

### Upload Document
```
POST /upload
Content-Type: multipart/form-data
Body: file (PDF)
```
Uploads and processes a PDF document.

### Chat
```
POST /chat
Content-Type: application/json
Body: {
  "userId": "string",
  "message": "string",
  "docId": "string" (optional)
}
```
Sends a message to the AI tutor and receives a response.

### Generate Quiz
```
POST /generate-quiz
Content-Type: application/json
Body: {
  "topic": "string",
  "docId": "string" (optional),
  "numQuestions": number (default: 5)
}
```
Generates a quiz on the specified topic.

### List Documents
```
GET /documents
```
Returns all uploaded documents.

### Delete Document
```
DELETE /documents/:docId
```
Deletes a document and all its vectors.

### Search Documents
```
POST /search
Content-Type: application/json
Body: {
  "query": "string",
  "topK": number (default: 5),
  "docId": "string" (optional)
}
```
Searches documents using semantic search.

---

## 🧪 Testing

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Upload Document:**
   ```bash
   curl -X POST -F "file=@test.pdf" http://localhost:8080/upload
   ```

3. **Chat:**
   ```bash
   curl -X POST http://localhost:8080/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "What is an array?"}'
   ```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Vertex AI** for powerful AI models
- **React Team** for an amazing framework
- **Express.js** for the robust backend framework
- All open-source contributors

---

## 📧 Support

For issues, questions, or contributions:

- 📖 Check the [Deployment Guide](./DEPLOYMENT.md)
- 🐛 Open an issue on [GitHub](https://github.com/Adityakumar1805/ai-tutor-agent/issues)
- 💬 Check existing issues for solutions

---

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Persistent vector database (Pinecone/Weaviate)
- [ ] Study plan generation
- [ ] Flashcard creation
- [ ] Progress analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Built with ❤️ using Vertex AI, RAG, and modern web technologies**

---

## ⚡ Quick Commands Reference

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (terminal 1)
cd backend && npm start

# Start frontend (terminal 2)
cd frontend && npm start

# Build for production
cd frontend && npm run build

# Run with Docker
docker-compose up -d

# Check backend health
curl http://localhost:8080/health
```

---

**Happy Learning! 🎓✨**

#blahblahbvassa
