import fs from 'fs';
import path from 'path';
import { CURATED_MEDICAL_KNOWLEDGE } from './seedData';
import { VectorStore } from './vectorStore';

async function ingest() {
  console.log('--- MediLens AI: Curated Medical Knowledge Ingestion ---');
  console.log(`Ingesting ${CURATED_MEDICAL_KNOWLEDGE.length} authoritative medical articles...`);

  const outputPath = path.join(__dirname, 'knowledgeBase.json');
  fs.writeFileSync(outputPath, JSON.stringify(CURATED_MEDICAL_KNOWLEDGE, null, 2), 'utf-8');
  console.log(`Saved knowledge base to: ${outputPath}`);

  if (process.env.GEMINI_API_KEY) {
    console.log('Generating Gemini embeddings with text-embedding-004...');
    const store = new VectorStore(process.env.GEMINI_API_KEY);
    await store.initializeIndex();
    console.log('Gemini embeddings precomputed successfully.');
  } else {
    console.log('GEMINI_API_KEY not set; using deterministic keyword/lexical indexing for local demonstration.');
  }

  console.log('RAG Ingestion completed.');
}

if (require.main === module) {
  ingest().catch(console.error);
}
