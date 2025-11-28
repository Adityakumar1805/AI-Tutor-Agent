// Next-Generation AI Tutor Agent Backend
// Features: Vertex AI, RAG, Vector Search, PDF Processing

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');

const vectorStore = require('./vectorStore');
const aiService = require('./aiService');

// Optional Firebase initialization
let firestore = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.GCS_BUCKET_NAME || undefined
      });
    }
    firestore = admin.firestore();
    console.log('✓ Firebase initialized');
  }
} catch (error) {
  console.warn('⚠ Firebase not configured (optional)');
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Multer configuration for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ==================== RAG PIPELINE ====================

/**
 * Process PDF: Extract text, chunk, generate embeddings, store in vector DB
 */
async function processPDF(filePath, filename) {
  try {
    console.log(`Processing PDF: ${filename}`);

    // 1. Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      throw new Error('PDF contains no extractable text');
    }

    // 2. Chunk text into smaller pieces
    const chunks = chunkText(text, 1000, 200); // 1000 chars with 200 overlap

    // 3. Generate embeddings for each chunk
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const vectors = [];
    const docId = uuidv4();

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await aiService.generateEmbedding(chunk);

      vectors.push({
        id: `${docId}-chunk-${i}`,
        documentId: docId,
        embedding,
        text: chunk,
        chunkIndex: i,
        metadata: {
          filename,
          page: Math.floor((i / chunks.length) * pdfData.numpages) || 1,
          totalPages: pdfData.numpages
        }
      });
    }

    // 4. Store in vector database
    vectorStore.addVectors(vectors);
    vectorStore.addDocument(docId, {
      filename,
      uploadedAt: new Date().toISOString(),
      numChunks: chunks.length,
      numPages: pdfData.numpages,
      filePath
    });

    // 5. Optionally store in Firestore
    if (firestore) {
      try {
        await firestore.collection('documents').doc(docId).set({
          filename,
          uploadedAt: new Date().toISOString(),
          numChunks: chunks.length,
          numPages: pdfData.numpages
        });
      } catch (err) {
        console.warn('Could not save to Firestore:', err.message);
      }
    }

    console.log(`✓ PDF processed: ${chunks.length} chunks indexed`);

    return {
      docId,
      chunks: chunks.length,
      pages: pdfData.numpages
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Chunk text into overlapping chunks
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start + chunkSize * 0.5) {
        end = breakPoint + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;
  }

  return chunks;
}

/**
 * Semantic search: Find relevant chunks for a query
 */
async function semanticSearch(query, topK = 5, docId = null) {
  // Generate embedding for query
  const queryEmbedding = await aiService.generateEmbedding(query);

  // Find similar vectors
  const results = vectorStore.findSimilar(queryEmbedding, topK, docId);

  return results;
}

// ==================== API ENDPOINTS ====================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  const stats = vectorStore.getStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    vectorStore: stats,
    vertexAI: aiService.initialized ? 'enabled' : 'fallback mode'
  });
});

/**
 * Upload PDF document
 */
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await processPDF(req.file.path, req.file.originalname);

    res.json({
      success: true,
      ...result,
      message: `PDF processed successfully: ${result.chunks} chunks indexed`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process PDF'
    });
  }
});

/**
 * Chat endpoint with RAG
 */
app.post('/chat', async (req, res) => {
  try {
    const { userId, message, docId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Perform semantic search to find relevant context
    const searchResults = await semanticSearch(message, 5, docId || null);
    const contexts = searchResults.map(r => ({
      text: r.text,
      similarity: r.similarity,
      metadata: r.metadata
    }));

    // 2. Generate AI response using contexts
    const reply = await aiService.generateChatResponse(message, contexts);

    // 3. Optionally store conversation
    if (firestore) {
      try {
        await firestore.collection('conversations').add({
          userId: userId || 'anonymous',
          message,
          reply,
          contexts: contexts.map(c => c.text),
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not save conversation:', err.message);
      }
    }

    res.json({
      reply,
      sources: contexts.map(c => ({
        text: c.text.substring(0, 200) + '...',
        similarity: c.similarity,
        filename: c.metadata?.filename
      })),
      usedRAG: contexts.length > 0
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process chat message'
    });
  }
});

/**
 * Generate quiz from study materials
 */
app.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, docId, numQuestions = 5 } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // 1. Get relevant contexts for the topic
    const searchResults = await semanticSearch(topic, 8, docId || null);
    const contexts = searchResults.map(r => ({
      text: r.text,
      similarity: r.similarity
    }));

    // 2. Generate quiz using AI
    const questions = await aiService.generateQuiz(topic, contexts, numQuestions);

    // 3. Optionally store quiz
    const quizId = uuidv4();
    if (firestore) {
      try {
        await firestore.collection('quizzes').doc(quizId).set({
          topic,
          questions,
          numQuestions,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not save quiz:', err.message);
      }
    }

    res.json({
      quizId,
      topic,
      questions,
      sources: contexts.length
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate quiz'
    });
  }
});

/**
 * Get all uploaded documents
 */
app.get('/documents', (req, res) => {
  try {
    const stats = vectorStore.getStats();
    const documents = Array.from(vectorStore.documents.values()).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      uploadedAt: doc.uploadedAt,
      numChunks: doc.numChunks,
      numPages: doc.numPages
    }));

    res.json({
      documents,
      total: stats.totalDocuments
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete document
 */
app.delete('/documents/:docId', (req, res) => {
  try {
    const { docId } = req.params;
    const document = vectorStore.getDocument(docId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from vector store
    vectorStore.deleteDocument(docId);

    // Delete physical file if exists
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        console.warn('Could not delete physical file:', err.message);
      }
    }

    // Delete from Firestore if configured
    if (firestore) {
      firestore.collection('documents').doc(docId).delete().catch(console.warn);
    }

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search documents
 */
app.post('/search', async (req, res) => {
  try {
    const { query, topK = 5, docId } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await semanticSearch(query, topK, docId || null);

    res.json({
      query,
      results: results.map(r => ({
        text: r.text,
        similarity: r.similarity,
        metadata: r.metadata,
        documentId: r.documentId
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 AI Tutor Agent Backend');
  console.log('='.repeat(50));
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Vertex AI: ${aiService.initialized ? '✅ Enabled' : '⚠️  Fallback Mode'}`);
  console.log(`📚 Vector Store: ${vectorStore.getStats().totalDocuments} documents`);
  console.log(`🔥 Firebase: ${firestore ? '✅ Enabled' : '⚠️  Not configured'}`);
  console.log('='.repeat(50));
  console.log('\n📖 Endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  POST /upload - Upload PDF');
  console.log('  POST /chat - Chat with AI tutor');
  console.log('  POST /generate-quiz - Generate quiz');
  console.log('  GET  /documents - List documents');
  console.log('  POST /search - Search documents');
  console.log('  DELETE /documents/:docId - Delete document');
  console.log('\n✨ Ready to learn!\n');
});