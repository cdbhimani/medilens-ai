import { ExtractedMeasurement, ReportAnalysis } from '../schemas/medicalReportSchema';
import { runDocumentIntakeAgent, IntakeInput } from './intakeAgent';
import { runValidationAgent } from './validationAgent';
import { evaluateAllMeasurements } from './referenceRangeAgent';
import { runRetrievalAgent } from './retrievalAgent';
import { runExplanationAgent } from './explanationAgent';
import { runSafetyAgent } from './safetyAgent';
import { runConsultationAgent } from './consultationAgent';
import { runReportAssemblyAgent } from './assemblyAgent';
import { getGeminiService } from '../services/geminiService';

export interface OrchestrationRequest {
  intakeInput: IntakeInput;
  preloadedMeasurements?: ExtractedMeasurement[];
  preloadedReportDate?: string;
  preloadedLabName?: string;
  patientContext?: {
    age?: number | null;
    gender?: string | null;
    fasting?: boolean | null;
  };
}

export interface OrchestrationResult {
  success: boolean;
  analysis?: ReportAnalysis;
  stagesCompleted: string[];
  durationMs: number;
  error?: string;
}

export async function orchestrateReportAnalysis(req: OrchestrationRequest): Promise<OrchestrationResult> {
  const startTime = Date.now();
  const stagesCompleted: string[] = [];

  try {
    // Stage 1: Document Intake Agent
    const intake = runDocumentIntakeAgent(req.intakeInput);
    if (!intake.isValid) {
      return {
        success: false,
        stagesCompleted,
        durationMs: Date.now() - startTime,
        error: intake.error || 'Document Intake failed.'
      };
    }
    stagesCompleted.push('Stage 1: Document Intake Agent');

    // Stage 2: Extraction Agent
    let extractedMeasurements: ExtractedMeasurement[] = [];
    let reportDate: string | null = req.preloadedReportDate || null;
    let labName: string | null = req.preloadedLabName || null;
    let usedFallback = false;
    let modelUsed = 'gemini-1.5-flash';

    if (req.preloadedMeasurements && req.preloadedMeasurements.length > 0) {
      extractedMeasurements = req.preloadedMeasurements;
      stagesCompleted.push('Stage 2: Extraction Agent (Preloaded Synthetic/Demo Record)');
    } else if (req.intakeInput.fileBuffer) {
      const gemini = getGeminiService();
      if (gemini.isConfigured()) {
        try {
          const extraction = await gemini.extractReportData(
            req.intakeInput.fileBuffer,
            req.intakeInput.fileMimeType,
            req.intakeInput.fileName
          );
          reportDate = extraction.reportDate;
          labName = extraction.labName;
          extractedMeasurements = extraction.measurements.map((m, idx) => ({
            id: `meas_${idx + 1}`,
            testName: m.testName,
            standardizedCode: m.standardizedCode || null,
            rawValue: m.rawValue,
            numericValue: m.numericValue,
            valueOperator: m.valueOperator || 'none',
            unit: m.unit || '',
            referenceIntervalRaw: m.referenceIntervalRaw || 'Not provided',
            referenceIntervalLow: m.referenceIntervalLow,
            referenceIntervalHigh: m.referenceIntervalHigh,
            referenceIntervalOperator: m.referenceIntervalOperator || 'none',
            labAbnormalFlag: m.labAbnormalFlag,
            specimenType: m.specimenType || null,
            comments: m.comments || null,
            sourcePage: m.sourcePage || 1,
            sourceLocationSnippet: m.sourceLocationSnippet || '',
            extractionConfidence: m.extractionConfidence || 0.95,
            validationIssues: [],
            userVerified: false,
            isAmbiguous: (m.extractionConfidence || 1.0) < 0.75
          }));
          stagesCompleted.push('Stage 2: Extraction Agent (Gemini Multimodal Document Processing)');
        } catch (geminiErr: any) {
          console.warn('Gemini extraction failed; using deterministic OCR fallback simulation:', geminiErr.message);
          usedFallback = true;
          stagesCompleted.push('Stage 2: Extraction Agent (OCR Fallback)');
        }
      } else {
        usedFallback = true;
        stagesCompleted.push('Stage 2: Extraction Agent (Simulated OCR Engine - API key not set)');
      }
    }

    if (extractedMeasurements.length === 0) {
      return {
        success: false,
        stagesCompleted,
        durationMs: Date.now() - startTime,
        error: 'No laboratory measurements could be extracted from the provided document. Please ensure the file is an legible medical report.'
      };
    }

    // Stage 3: Validation Agent
    const validation = runValidationAgent(extractedMeasurements);
    stagesCompleted.push(`Stage 3: Validation Agent (${validation.ambiguitiesCount} ambiguities flagged)`);

    // Stage 4: Reference-Range Evaluation Agent (Deterministic)
    const evaluatedMeasurements = evaluateAllMeasurements(validation.validatedMeasurements);
    stagesCompleted.push('Stage 4: Reference-Range Evaluation Agent (Deterministic numerical logic)');

    // Stage 5: Medical Knowledge Retrieval Agent (RAG)
    const retrieval = await runRetrievalAgent(evaluatedMeasurements);
    stagesCompleted.push(`Stage 5: Medical Knowledge Retrieval Agent (${retrieval.allRetrievedSources.length} sources matched)`);

    // Stage 6: Explanation Agent
    const explanations = await runExplanationAgent(evaluatedMeasurements, retrieval.measurementCitations);
    stagesCompleted.push('Stage 6: Explanation Agent (Grounded plain-language explanations)');

    // Stage 7: Safety and Triage Agent (Deterministic Clinician Rules)
    const safetyAlerts = runSafetyAgent(evaluatedMeasurements);
    stagesCompleted.push(`Stage 7: Safety and Triage Agent (${safetyAlerts.length} alerts evaluated)`);

    // Stage 8: Consultation Preparation Agent
    const consultationPrep = runConsultationAgent(evaluatedMeasurements, safetyAlerts, req.patientContext);
    stagesCompleted.push('Stage 8: Consultation Preparation Agent');

    // Stage 9: Report Assembly Agent
    const durationMs = Date.now() - startTime;
    const finalReport = runReportAssemblyAgent({
      reportId: intake.reportId,
      userId: intake.userId,
      reportDate,
      labName,
      patientContextProvided: req.patientContext,
      processingMetadata: {
        fileFormat: intake.fileMimeType,
        fileName: intake.fileName,
        fileSize: intake.fileSize,
        isScannedOrDigital: intake.isScannedOrDigital,
        stagesCompleted,
        totalDurationMs: durationMs,
        modelUsed: usedFallback ? 'Deterministic-Engine' : modelUsed,
        usedFallback
      },
      measurements: evaluatedMeasurements,
      explanations,
      safetyAlerts,
      consultationPrep,
      sourceKnowledgeDocuments: retrieval.allRetrievedSources
    });

    stagesCompleted.push('Stage 9: Report Assembly Agent');

    return {
      success: true,
      analysis: finalReport,
      stagesCompleted,
      durationMs
    };
  } catch (err: any) {
    return {
      success: false,
      stagesCompleted,
      durationMs: Date.now() - startTime,
      error: `Workflow execution error: ${err.message}`
    };
  }
}
