import { GoogleGenerativeAI } from '@google/generative-ai';
import { CURATED_MEDICAL_KNOWLEDGE, CuratedMedicalArticle } from './seedData';
import { MedicalKnowledgeCitation } from '../schemas/medicalReportSchema';

export interface IndexedDocument extends CuratedMedicalArticle {
  embedding?: number[];
}

export class VectorStore {
  private documents: IndexedDocument[] = [];
  private genAI: GoogleGenerativeAI | null = null;
  private embeddingModelName = 'text-embedding-004';

  constructor(apiKey?: string) {
    if (apiKey && apiKey.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    this.documents = [...CURATED_MEDICAL_KNOWLEDGE];
  }

  public async initializeIndex(): Promise<void> {
    // If Gemini API is available, generate real embeddings
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.embeddingModelName });
        for (const doc of this.documents) {
          const textToEmbed = `${doc.title} ${doc.testKeywords.join(' ')} ${doc.passage}`;
          const res = await model.embedContent(textToEmbed);
          if (res.embedding && res.embedding.values) {
            doc.embedding = res.embedding.values;
          }
        }
      } catch (err) {
        console.warn('VectorStore: Could not pre-embed with Gemini, falling back to lexical search:', err);
      }
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async retrieve(query: string, limit: number = 2): Promise<MedicalKnowledgeCitation[]> {
    const queryNorm = query.toLowerCase().trim();
    const queryTerms = queryNorm.split(/\s+/).filter(t => t.length > 2);

    // If Gemini embeddings are configured and document embeddings exist
    if (this.genAI && this.documents.some(d => d.embedding && d.embedding.length > 0)) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.embeddingModelName });
        const res = await model.embedContent(query);
        const queryEmbedding = res.embedding.values;

        const scored = this.documents.map(doc => {
          let score = 0;
          if (doc.embedding) {
            score = this.cosineSimilarity(queryEmbedding, doc.embedding);
          }
          return { doc, score };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, limit).map(({ doc, score }) => ({
          id: doc.id,
          title: doc.title,
          publisher: doc.publisher,
          url: doc.url,
          publishedOrReviewedDate: doc.reviewedDate,
          accessedDate: doc.accessedDate,
          passage: doc.passage,
          relevanceScore: Number(score.toFixed(4))
        }));
      } catch (err) {
        console.warn('Embedding query failed, falling back to keyword scoring:', err);
      }
    }

    // Lexical / Keyword BM25-style fallback matching
    const scoredDocs = this.documents.map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const passageLower = doc.passage.toLowerCase();

      // Check keywords
      for (const kw of doc.testKeywords) {
        if (queryNorm.includes(kw.toLowerCase())) {
          score += 3.0;
        }
      }

      // Check query terms in title and passage
      for (const term of queryTerms) {
        if (titleLower.includes(term)) score += 2.0;
        if (passageLower.includes(term)) score += 1.0;
      }

      return { doc, score };
    });

    scoredDocs.sort((a, b) => b.score - a.score);

    // Filter to relevant matches with positive score
    const topMatches = scoredDocs.filter(item => item.score > 0).slice(0, limit);

    // If nothing matched, take closest relevant fallback
    const finalDocs = topMatches.length > 0 ? topMatches : scoredDocs.slice(0, 1);

    return finalDocs.map(({ doc, score }) => ({
      id: doc.id,
      title: doc.title,
      publisher: doc.publisher,
      url: doc.url,
      publishedOrReviewedDate: doc.reviewedDate,
      accessedDate: doc.accessedDate,
      passage: doc.passage,
      relevanceScore: Math.min(1.0, Number((score > 0 ? 0.75 + score * 0.05 : 0.50).toFixed(2)))
    }));
  }
}

let globalVectorStore: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (!globalVectorStore) {
    globalVectorStore = new VectorStore(process.env.GEMINI_API_KEY);
  }
  return globalVectorStore;
}
