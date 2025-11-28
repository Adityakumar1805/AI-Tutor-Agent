// In-memory Vector Store for RAG
// Can be easily replaced with Pinecone, Weaviate, or Vertex AI Matching Engine

class VectorStore {
  constructor() {
    this.vectors = []; // [{ id, embedding, text, metadata }]
    this.documents = new Map(); // documentId -> document info
  }

  /**
   * Add embeddings to vector store
   */
  addVectors(vectors) {
    this.vectors.push(...vectors);
    return vectors.length;
  }

  /**
   * Add document metadata
   */
  addDocument(docId, metadata) {
    this.documents.set(docId, {
      ...metadata,
      id: docId,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Find similar vectors using cosine similarity
   */
  findSimilar(queryEmbedding, topK = 5, filterDocId = null) {
    let candidates = this.vectors;

    // Filter by document if specified
    if (filterDocId) {
      candidates = candidates.filter(v => v.documentId === filterDocId);
    }

    // Calculate cosine similarity
    const similarities = candidates.map(vector => {
      const similarity = this.cosineSimilarity(queryEmbedding, vector.embedding);
      return {
        ...vector,
        similarity
      };
    });

    // Sort by similarity (descending) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(({ embedding, ...rest }) => rest); // Remove embedding from response
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get all vectors for a document
   */
  getDocumentVectors(docId) {
    return this.vectors.filter(v => v.documentId === docId);
  }

  /**
   * Delete document and its vectors
   */
  deleteDocument(docId) {
    this.vectors = this.vectors.filter(v => v.documentId !== docId);
    this.documents.delete(docId);
  }

  /**
   * Get document info
   */
  getDocument(docId) {
    return this.documents.get(docId);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalVectors: this.vectors.length,
      totalDocuments: this.documents.size
    };
  }
}

// Export singleton instance
module.exports = new VectorStore();
