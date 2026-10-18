export type EvaluationStatus = 'below' | 'within' | 'above' | 'indeterminate';
export type SafetySeverity = 'emergency' | 'critical' | 'urgent' | 'warning' | 'info';

export interface ExtractedMeasurement {
  id: string;
  testName: string;
  standardizedCode?: string | null;
  rawValue: string;
  numericValue: number | null;
  valueOperator?: string;
  unit: string;
  referenceIntervalRaw: string;
  referenceIntervalLow: number | null;
  referenceIntervalHigh: number | null;
  referenceIntervalOperator?: string;
  labAbnormalFlag: string | null;
  specimenType?: string | null;
  comments?: string | null;
  sourcePage: number;
  sourceLocationSnippet: string;
  extractionConfidence: number;
  validationIssues: string[];
  userVerified: boolean;
  isAmbiguous: boolean;
}

export interface EvaluatedMeasurement extends ExtractedMeasurement {
  evaluationStatus: EvaluationStatus;
  evaluationReason: string;
}

export interface MedicalKnowledgeCitation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedOrReviewedDate?: string | null;
  accessedDate: string;
  passage: string;
  relevanceScore: number;
}

export interface MeasurementExplanation {
  testName: string;
  plainLanguageSummary: string;
  whatItMeasures: string;
  potentialHighLowReasons: string;
  limitationsAndContext: string;
  citations: MedicalKnowledgeCitation[];
  uncertaintyDisclaimer?: string | null;
}

export interface SafetyAlert {
  severity: SafetySeverity;
  testName?: string | null;
  ruleId: string;
  ruleSource: string;
  title: string;
  message: string;
  recommendedAction: string;
  isMockDemonstration?: boolean;
}

export interface DoctorConsultationPrep {
  suggestedQuestions: string[];
  missingContext: string[];
  reportSummaryText: string;
  clinicalReviewWarranted: boolean;
  reviewWarrantedReason?: string | null;
}

export interface HistoricalComparisonItem {
  testName: string;
  standardizedCode?: string | null;
  earlierDate: string;
  earlierValue: number;
  earlierUnit: string;
  newerDate: string;
  newerValue: number;
  newerUnit: string;
  normalizedEarlierValue: number;
  normalizedNewerValue: number;
  normalizedUnit: string;
  absoluteChange: number | null;
  percentChange: number | null;
  isComparable: boolean;
  comparabilityNote: string;
  trendDescription: string;
}

export interface ReportSummaryItem {
  reportId: string;
  reportDate: string | null;
  labName: string | null;
  createdAt: string;
  fileName: string;
  testCount: number;
  abnormalCount: number;
  criticalCount: number;
  hasAmbiguities: boolean;
}

export interface ReportAnalysis {
  reportId: string;
  userId: string;
  createdAt: string;
  reportDate: string | null;
  labName: string | null;
  patientContextProvided?: {
    age?: number | null;
    gender?: string | null;
    fasting?: boolean | null;
  };
  processingMetadata: {
    fileFormat: string;
    fileName: string;
    fileSize: number;
    isScannedOrDigital: 'digital' | 'scanned' | 'mixed';
    stagesCompleted: string[];
    totalDurationMs: number;
    modelUsed: string;
    usedFallback: boolean;
  };
  measurements: EvaluatedMeasurement[];
  explanations: MeasurementExplanation[];
  safetyAlerts: SafetyAlert[];
  consultationPrep: DoctorConsultationPrep;
  overallDisclaimer: string;
  sourceKnowledgeDocuments: MedicalKnowledgeCitation[];
}

export interface DemoReportSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  reportDate: string;
  labName: string;
  testCount: number;
}
