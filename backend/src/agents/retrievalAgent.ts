import { EvaluatedMeasurement, MedicalKnowledgeCitation } from '../schemas/medicalReportSchema';
import { getVectorStore } from '../rag/vectorStore';

export interface RetrievalResult {
  measurementCitations: Map<string, MedicalKnowledgeCitation[]>;
  allRetrievedSources: MedicalKnowledgeCitation[];
}

export async function runRetrievalAgent(measurements: EvaluatedMeasurement[]): Promise<RetrievalResult> {
  const store = getVectorStore();
  const measurementCitations = new Map<string, MedicalKnowledgeCitation[]>();
  const sourceMap = new Map<string, MedicalKnowledgeCitation>();

  for (const m of measurements) {
    const query = `${m.testName} ${m.unit} reference interval ${m.evaluationStatus}`;
    const citations = await store.retrieve(query, 2);

    measurementCitations.set(m.id, citations);

    for (const c of citations) {
      if (!sourceMap.has(c.id)) {
        sourceMap.set(c.id, c);
      }
    }
  }

  return {
    measurementCitations,
    allRetrievedSources: Array.from(sourceMap.values())
  };
}
