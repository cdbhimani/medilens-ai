import { z } from 'zod';

export const ValueOperatorEnum = z.enum(['<', '<=', '>', '>=', '=', 'none']);
export const ReferenceOperatorEnum = z.enum(['<', '<=', '>', '>=', 'range', 'textual', 'none']);
export const EvaluationStatusEnum = z.enum(['below', 'within', 'above', 'indeterminate']);
export const SafetySeverityEnum = z.enum(['emergency', 'critical', 'urgent', 'warning', 'info']);
export const DocumentTypeEnum = z.enum(['digital', 'scanned', 'mixed']);

export const ExtractedMeasurementSchema = z.object({
  id: z.string(),
  testName: z.string(),
  standardizedCode: z.string().optional().nullable(),
  rawValue: z.string(),
  numericValue: z.number().nullable(),
  valueOperator: ValueOperatorEnum.default('none'),
  unit: z.string().default(''),
  referenceIntervalRaw: z.string().default('Not provided'),
  referenceIntervalLow: z.number().nullable().default(null),
  referenceIntervalHigh: z.number().nullable().default(null),
  referenceIntervalOperator: ReferenceOperatorEnum.default('none'),
  labAbnormalFlag: z.string().nullable().default(null),
  specimenType: z.string().nullable().default(null),
  comments: z.string().nullable().default(null),
  sourcePage: z.number().default(1),
  sourceLocationSnippet: z.string().default(''),
  extractionConfidence: z.number().min(0).max(1).default(0.95),
  validationIssues: z.array(z.string()).default([]),
  userVerified: z.boolean().default(false),
  isAmbiguous: z.boolean().default(false)
});

export type ExtractedMeasurement = z.infer<typeof ExtractedMeasurementSchema>;

export const EvaluatedMeasurementSchema = ExtractedMeasurementSchema.extend({
  evaluationStatus: EvaluationStatusEnum,
  evaluationReason: z.string()
});

export type EvaluatedMeasurement = z.infer<typeof EvaluatedMeasurementSchema>;

export const MedicalKnowledgeCitationSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  url: z.string(),
  publishedOrReviewedDate: z.string().optional().nullable(),
  accessedDate: z.string(),
  passage: z.string(),
  relevanceScore: z.number()
});

export type MedicalKnowledgeCitation = z.infer<typeof MedicalKnowledgeCitationSchema>;

export const MeasurementExplanationSchema = z.object({
  testName: z.string(),
  plainLanguageSummary: z.string(),
  whatItMeasures: z.string(),
  potentialHighLowReasons: z.string(),
  limitationsAndContext: z.string(),
  citations: z.array(MedicalKnowledgeCitationSchema),
  uncertaintyDisclaimer: z.string().optional().nullable()
});

export type MeasurementExplanation = z.infer<typeof MeasurementExplanationSchema>;

export const SafetyAlertSchema = z.object({
  severity: SafetySeverityEnum,
  testName: z.string().optional().nullable(),
  ruleId: z.string(),
  ruleSource: z.string(),
  title: z.string(),
  message: z.string(),
  recommendedAction: z.string(),
  isMockDemonstration: z.boolean().default(false)
});

export type SafetyAlert = z.infer<typeof SafetyAlertSchema>;

export const DoctorConsultationPrepSchema = z.object({
  suggestedQuestions: z.array(z.string()),
  missingContext: z.array(z.string()),
  reportSummaryText: z.string(),
  clinicalReviewWarranted: z.boolean(),
  reviewWarrantedReason: z.string().optional().nullable()
});

export type DoctorConsultationPrep = z.infer<typeof DoctorConsultationPrepSchema>;

export const HistoricalComparisonItemSchema = z.object({
  testName: z.string(),
  standardizedCode: z.string().optional().nullable(),
  earlierDate: z.string(),
  earlierValue: z.number(),
  earlierUnit: z.string(),
  newerDate: z.string(),
  newerValue: z.number(),
  newerUnit: z.string(),
  normalizedEarlierValue: z.number(),
  normalizedNewerValue: z.number(),
  normalizedUnit: z.string(),
  absoluteChange: z.number().nullable(),
  percentChange: z.number().nullable(),
  isComparable: z.boolean(),
  comparabilityNote: z.string(),
  trendDescription: z.string()
});

export type HistoricalComparisonItem = z.infer<typeof HistoricalComparisonItemSchema>;

export const ProcessingMetadataSchema = z.object({
  fileFormat: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  isScannedOrDigital: DocumentTypeEnum,
  stagesCompleted: z.array(z.string()),
  totalDurationMs: z.number(),
  modelUsed: z.string(),
  usedFallback: z.boolean()
});

export type ProcessingMetadata = z.infer<typeof ProcessingMetadataSchema>;

export const ReportAnalysisSchema = z.object({
  reportId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  reportDate: z.string().nullable().default(null),
  labName: z.string().nullable().default(null),
  patientContextProvided: z.object({
    age: z.number().optional().nullable(),
    gender: z.string().optional().nullable(),
    fasting: z.boolean().optional().nullable()
  }).default({}),
  processingMetadata: ProcessingMetadataSchema,
  measurements: z.array(EvaluatedMeasurementSchema),
  explanations: z.array(MeasurementExplanationSchema),
  safetyAlerts: z.array(SafetyAlertSchema),
  consultationPrep: DoctorConsultationPrepSchema,
  overallDisclaimer: z.string(),
  sourceKnowledgeDocuments: z.array(MedicalKnowledgeCitationSchema)
});

export type ReportAnalysis = z.infer<typeof ReportAnalysisSchema>;
