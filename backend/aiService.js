// AI Service for Vertex AI Integration
const { VertexAI } = require('@google-cloud/aiplatform');
const { v1 } = require('@google-cloud/aiplatform');

class AIService {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
    this.location = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
    this.model = process.env.VERTEX_AI_MODEL || 'gemini-1.5-flash-001';
    this.embeddingModel = process.env.VERTEX_AI_EMBEDDING_MODEL || 'textembedding-gecko@003';
    
    // Initialize Vertex AI client
    // Check if we have proper configuration
    if (this.projectId && this.projectId !== 'your-project-id' && 
        (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT)) {
      try {
        this.vertexAI = new VertexAI({
          project: this.projectId,
          location: this.location,
        });
        
        this.initialized = true;
        console.log(`✓ Vertex AI initialized for project: ${this.projectId}`);
      } catch (error) {
        console.warn('⚠ Vertex AI initialization failed. Using fallback mode.');
        console.warn('Error:', error.message);
        this.initialized = false;
      }
    } else {
      console.warn('⚠ Vertex AI not configured. Using fallback mode.');
      console.warn('To enable Vertex AI, set GOOGLE_CLOUD_PROJECT_ID and credentials.');
      this.initialized = false;
    }
  }

  /**
   * Generate embeddings using Vertex AI
   */
  async generateEmbedding(text) {
    if (!this.initialized) {
      // Fallback: simple hash-based embedding (not real, but works for demo)
      return this.fallbackEmbedding(text);
    }

    try {
      const { PredictionServiceClient } = v1;
      const predictionServiceClient = new PredictionServiceClient();

      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.embeddingModel}`;
      
      const instance = { content: text };
      const request = {
        endpoint,
        instances: [instance],
      };

      const [response] = await predictionServiceClient.predict(request);
      const embedding = response.predictions[0].embeddings.values || response.predictions[0].embeddings;
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      return this.fallbackEmbedding(text);
    }
  }

  /**
   * Fallback embedding (simple hash-based for demo)
   */
  fallbackEmbedding(text) {
    // Simple hash-based embedding (768 dimensions)
    const embedding = new Array(768).fill(0);
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let i = 0; i < 768; i++) {
      embedding[i] = Math.sin(hash * (i + 1)) * 0.1;
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  /**
   * Generate chat response using Vertex AI Gemini
   */
  async generateChatResponse(message, contexts = [], conversationHistory = []) {
    if (!this.initialized) {
      // Fallback: intelligent responses without Vertex AI
      return this.fallbackChatResponse(message, contexts);
    }

    try {
      const { PredictionServiceClient } = v1;
      const predictionServiceClient = new PredictionServiceClient();

      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;

      // Build context from retrieved documents
      let contextText = '';
      if (contexts.length > 0) {
        contextText = `\n\nRelevant study material:\n${contexts.map((ctx, i) => `[${i + 1}] ${ctx.text || ctx}`).join('\n\n')}`;
      }

      // Build conversation history
      let historyText = '';
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-4); // Last 4 messages
        historyText = `\n\nPrevious conversation:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}`;
      }

      const prompt = `You are an intelligent AI tutor helping students learn. Answer questions based on the provided study materials when available.

${contextText}

${historyText}

Student question: ${message}

Provide a clear, helpful, and educational response. If the answer is in the study materials, cite specific sources. If not, provide general guidance based on your knowledge.`;

      const instance = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      };

      const request = {
        endpoint,
        instances: [instance],
      };

      const [response] = await predictionServiceClient.predict(request);
      const content = response.predictions[0].candidates[0].content.parts[0].text;

      return content;
    } catch (error) {
      console.error('Error generating chat response:', error.message);
      return this.fallbackChatResponse(message, contexts);
    }
  }

  /**
   * Fallback chat response (intelligent without Vertex AI)
   */
  fallbackChatResponse(message, contexts = []) {
    const lowerMessage = message.toLowerCase().trim();

    // Use contexts if available
    if (contexts.length > 0) {
      const contextText = contexts.map((ctx, i) => `[${i + 1}] ${ctx.text || ctx}`).join('\n\n');
      return `Based on your study materials:\n\n${contextText}\n\n${this.getHelpfulResponse(lowerMessage)}`;
    }

    return this.getHelpfulResponse(lowerMessage);
  }

  /**
   * Get helpful response for common questions
   */
  getHelpfulResponse(message) {
    // Math/Trigonometry
    if (message.includes('sin') && (message.includes('theta') || message.includes('θ'))) {
      return `The sine function is a fundamental trigonometric function:\n\n• **Definition**: sin(θ) = opposite/hypotenuse in a right triangle\n• **Unit Circle**: sin(θ) = y-coordinate on the unit circle\n\n**Key Values**:\n- sin(0°) = 0\n- sin(30°) = 1/2\n- sin(45°) = √2/2\n- sin(60°) = √3/2\n- sin(90°) = 1\n\n**Important Identities**:\n- sin²(θ) + cos²(θ) = 1\n- sin(90° - θ) = cos(θ)\n- sin(-θ) = -sin(θ)\n\nWould you like me to explain any specific application or concept related to sine?`;
    }

    // Arrays/Data Structures
    if (message.includes('array') || message.includes('dsa') || message.includes('data structure')) {
      return `**Arrays** are fundamental data structures:\n\n• **Definition**: A collection of elements stored in contiguous memory locations, accessible by index\n\n• **Key Characteristics**:\n  - Fixed or dynamic size\n  - Zero-based indexing (usually)\n  - Random access (O(1))\n\n• **Time Complexities**:\n  - Access: O(1)\n  - Search: O(n)\n  - Insertion: O(n)\n  - Deletion: O(n)\n\n• **Common Operations**:\n  - Traversal\n  - Searching (linear, binary)\n  - Sorting (bubble, merge, quick)\n  - Insertion/Deletion\n\nWould you like to dive deeper into any specific aspect of arrays?`;
    }

    // Greetings
    if (message === 'hi' || message === 'hello' || message === 'hey') {
      return `Hello! 👋 I'm your AI Tutor Agent. I'm here to help you learn! 🎓\n\nI can help you with:\n• Understanding concepts from your study materials\n• Answering questions with explanations\n• Generating quizzes and practice problems\n• Providing step-by-step guidance\n\n**To get the best experience:**\n1. Upload your study materials (PDFs)\n2. Ask me questions based on them\n3. I'll provide answers grounded in your materials\n\nWhat would you like to learn today?`;
    }

    // General help
    if (message.includes('help') || message.includes('what can you do')) {
      return `I'm your AI Tutor Agent! Here's what I can do:\n\n📚 **Study Assistance**:\n- Answer questions from your uploaded study materials\n- Explain concepts step-by-step\n- Provide examples and analogies\n\n📝 **Quiz Generation**:\n- Create quizzes from your study materials\n- Multiple question types (MCQ, short answer)\n- Auto-grading and feedback\n\n💡 **Learning Support**:\n- Break down complex topics\n- Provide personalized explanations\n- Help you understand difficult concepts\n\n**To get started:**\n1. Upload your PDF study materials\n2. Ask me questions about the content\n3. Generate quizzes to test your knowledge\n\nWhat would you like to try first?`;
    }

    // Default response
    return `I'd be happy to help with "${message}"! \n\n**To provide the best answer:**\n1. Upload your study materials (PDFs) for context-aware responses\n2. Ask specific questions about the content\n3. I'll search through your materials and provide detailed explanations\n\n**Current Status:**\n- ${contexts.length > 0 ? '✅ Using your study materials' : '⚠️ No study materials uploaded yet (using general knowledge)'}\n\nCould you provide more details about what you'd like to learn? For example:\n• Math concepts and formulas\n• Programming and data structures\n• Science topics\n• Any subject you're studying!`;
  }

  /**
   * Generate quiz from study materials
   */
  async generateQuiz(topic, contexts = [], numQuestions = 5) {
    if (!this.initialized) {
      return this.fallbackQuizGeneration(topic, contexts, numQuestions);
    }

    try {
      const { PredictionServiceClient } = v1;
      const predictionServiceClient = new PredictionServiceClient();

      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;

      const contextText = contexts.length > 0
        ? `\n\nStudy material:\n${contexts.map((ctx, i) => `[${i + 1}] ${ctx.text || ctx}`).join('\n\n')}`
        : '';

      const prompt = `Generate a ${numQuestions}-question quiz on the topic: "${topic}"${contextText}

Create a JSON array with questions in this exact format:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Why this answer is correct"
  },
  {
    "id": 2,
    "type": "short",
    "question": "Question text here",
    "answer": "Expected answer",
    "explanation": "Explanation here"
  }
]

Mix question types (mcq and short answer). Base questions on the study material if provided. Return ONLY valid JSON, no additional text.`;

      const instance = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      };

      const request = {
        endpoint,
        instances: [instance],
      };

      const [response] = await predictionServiceClient.predict(request);
      const content = response.predictions[0].candidates[0].content.parts[0].text;
      
      // Try to extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.fallbackQuizGeneration(topic, contexts, numQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error.message);
      return this.fallbackQuizGeneration(topic, contexts, numQuestions);
    }
  }

  /**
   * Fallback quiz generation
   */
  fallbackQuizGeneration(topic, contexts = [], numQuestions = 5) {
    const questions = [];

    // Generate MCQ questions
    const mcqCount = Math.ceil(numQuestions * 0.6);
    for (let i = 1; i <= mcqCount; i++) {
      questions.push({
        id: i,
        type: 'mcq',
        question: `What is a key concept or important aspect of ${topic}?`,
        options: [
          'Option A - First concept',
          'Option B - Second concept',
          'Option C - Third concept',
          'Option D - Fourth concept'
        ],
        answer: 'Option A - First concept',
        explanation: `This question tests your understanding of ${topic}. Review the study materials to understand the key concepts better.`
      });
    }

    // Generate short answer questions
    for (let i = mcqCount + 1; i <= numQuestions; i++) {
      questions.push({
        id: i,
        type: 'short',
        question: `Explain ${topic} in your own words or describe a specific aspect of it.`,
        answer: `An explanation of ${topic} would include...`,
        explanation: `Review your study materials to provide a comprehensive answer about ${topic}.`
      });
    }

    return questions;
  }
}

module.exports = new AIService();
