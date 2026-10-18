import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiExtractionResult {
  reportDate: string | null;
  labName: string | null;
  specimenType: string | null;
  measurements: Array<{
    testName: string;
    standardizedCode?: string;
    rawValue: string;
    numericValue: number | null;
    valueOperator: '<' | '<=' | '>' | '>=' | '=' | 'none';
    unit: string;
    referenceIntervalRaw: string;
    referenceIntervalLow: number | null;
    referenceIntervalHigh: number | null;
    referenceIntervalOperator: '<' | '<=' | '>' | '>=' | 'range' | 'textual' | 'none';
    labAbnormalFlag: string | null;
    specimenType?: string;
    comments?: string;
    sourcePage: number;
    sourceLocationSnippet: string;
    extractionConfidence: number;
  }>;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key && key.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  public isConfigured(): boolean {
    return this.genAI !== null;
  }

  public async extractReportData(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<GeminiExtractionResult> {
    if (!this.genAI) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const prompt = `
You are a specialized medical laboratory document parser. 
Analyze the provided medical report document and extract every test result exactly as reported.

CRITICAL RULES:
1. NEVER fabricate or guess missing values, ranges, units, or dates.
2. If a reference interval is missing or not given in the report, output referenceIntervalRaw as "Not provided", referenceIntervalLow as null, referenceIntervalHigh as null, and referenceIntervalOperator as "none".
3. Preserve raw reported values exactly (including <, >, <=, >=, decimal places).
4. Parse numericValue as a number if possible, or null for non-numeric/qualitative tests.
5. Parse valueOperator as '<', '<=', '>', '>=', '=' or 'none'.
6. Parse referenceIntervalOperator as '<', '<=', '>', '>=', 'range', 'textual', or 'none'.
7. Extract the exact printed unit (e.g., 'g/dL', 'mg/dL', 'mmol/L', '10^3/uL', '%').
8. Extract laboratory printed abnormal flags if any (e.g. 'H', 'L', 'CRITICAL', 'HIGH', 'LOW').
9. Keep distinct tests separate.
10. Output ONLY valid JSON matching this structure:
{
  "reportDate": "YYYY-MM-DD or null",
  "labName": "Laboratory name or null",
  "specimenType": "Serum/Blood/Urine or null",
  "measurements": [
    {
      "testName": "Test name",
      "standardizedCode": "LOINC code if known or null",
      "rawValue": "Original string value",
      "numericValue": 12.4,
      "valueOperator": "none",
      "unit": "unit string",
      "referenceIntervalRaw": "reference interval string as printed",
      "referenceIntervalLow": 12.0,
      "referenceIntervalHigh": 16.0,
      "referenceIntervalOperator": "range",
      "labAbnormalFlag": "H or null",
      "specimenType": "Blood",
      "comments": "Any footnote or null",
      "sourcePage": 1,
      "sourceLocationSnippet": "Short snippet of text from the page",
      "extractionConfidence": 0.95
    }
  ]
}
`;

    const base64Data = fileBuffer.toString('base64');
    const part = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, part]);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as GeminiExtractionResult;
    return parsed;
  }

  public async generatePlainExplanation(
    testName: string,
    measuredValue: string,
    unit: string,
    status: string,
    referenceRange: string,
    medicalPassage: string
  ): Promise<string> {
    if (!this.genAI) {
      return `This test evaluates ${testName}. The measured value was ${measuredValue} ${unit} (Laboratory range: ${referenceRange}). Please consult your clinician to interpret what this result means in your personal health context.`;
    }

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: { temperature: 0.2 }
    });

    const prompt = `
You are MediLens AI, an educational healthcare communication assistant.
Explain the following medical laboratory test result in plain, clear, accessible language for a patient.

Test: ${testName}
Measured Value: ${measuredValue} ${unit}
Status relative to lab reference range: ${status}
Stated Reference Interval: ${referenceRange}
Authoritative Medical Evidence: "${medicalPassage}"

STRICT HEALTHCARE SAFETY GUIDELINES:
1. Explain what the test generally measures and common reasons why a result might be higher or lower.
2. DO NOT diagnose any disease or medical condition.
3. DO NOT recommend medications, supplements, or dosage adjustments.
4. DO NOT advise stopping or altering any prescribed treatment.
5. Clearly state that a single value within or outside reference range is not a diagnosis.
6. Keep the explanation under 120 words.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }
}

let geminiServiceInstance: GeminiService | null = null;

export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
}
