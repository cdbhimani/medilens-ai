import { runValidationAgent } from '../src/agents/validationAgent';
import { getVectorStore } from '../src/rag/vectorStore';
import { ExtractedMeasurement } from '../src/schemas/medicalReportSchema';

describe('Validation Agent and RAG Retrieval Agent', () => {
  test('flags low OCR confidence and ambiguous numbers', () => {
    const rawMeasurements: ExtractedMeasurement[] = [
      {
        id: 'val-1',
        testName: 'Hemoglobin',
        rawValue: '14.?2',
        numericValue: 14.2,
        valueOperator: 'none',
        unit: 'g/dL',
        referenceIntervalRaw: '12.0 - 15.5',
        referenceIntervalLow: 12.0,
        referenceIntervalHigh: 15.5,
        referenceIntervalOperator: 'range',
        labAbnormalFlag: null,
        specimenType: 'Blood',
        comments: null,
        sourcePage: 1,
        sourceLocationSnippet: '',
        extractionConfidence: 0.55, // Low OCR confidence
        validationIssues: [],
        userVerified: false,
        isAmbiguous: false
      }
    ];

    const result = runValidationAgent(rawMeasurements);
    expect(result.hasMaterialAmbiguity).toBe(true);
    expect(result.ambiguitiesCount).toBe(1);
    expect(result.validatedMeasurements[0].isAmbiguous).toBe(true);
    expect(result.validatedMeasurements[0].validationIssues.some(i => i.includes('Low OCR extraction confidence'))).toBe(true);
  });

  test('flags inverted reference ranges (low > high)', () => {
    const invertedMeasurement: ExtractedMeasurement = {
      id: 'inv-1',
      testName: 'Sodium',
      rawValue: '140',
      numericValue: 140,
      valueOperator: 'none',
      unit: 'mmol/L',
      referenceIntervalRaw: '145 - 135',
      referenceIntervalLow: 145,
      referenceIntervalHigh: 135, // Inverted!
      referenceIntervalOperator: 'range',
      labAbnormalFlag: null,
      specimenType: 'Blood',
      comments: null,
      sourcePage: 1,
      sourceLocationSnippet: '',
      extractionConfidence: 0.99,
      validationIssues: [],
      userVerified: true,
      isAmbiguous: false
    };

    const result = runValidationAgent([invertedMeasurement]);
    expect(result.validatedMeasurements[0].validationIssues.some(i => i.includes('Inverted laboratory reference range'))).toBe(true);
  });

  test('RAG retrieves authoritative MedlinePlus evidence with citations', async () => {
    const store = getVectorStore();
    const citations = await store.retrieve('Hemoglobin test anemia red blood cells', 2);
    expect(citations.length).toBeGreaterThan(0);
    const topCitation = citations[0];
    expect(topCitation.title).toContain('Hemoglobin');
    expect(topCitation.publisher).toContain('MedlinePlus');
    expect(topCitation.url).toContain('https://medlineplus.gov');
    expect(topCitation.passage).toContain('Hemoglobin is an iron-rich protein');
  });
});
