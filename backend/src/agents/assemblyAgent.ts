import {
  EvaluatedMeasurement,
  MeasurementExplanation,
  SafetyAlert,
  DoctorConsultationPrep,
  MedicalKnowledgeCitation,
  ProcessingMetadata,
  ReportAnalysis
} from '../schemas/medicalReportSchema';
import { MANDATORY_SAFETY_DISCLAIMER } from '../safety/disclaimer';

export interface AssemblyInput {
  reportId: string;
  userId: string;
  reportDate: string | null;
  labName: string | null;
  patientContextProvided?: {
    age?: number | null;
    gender?: string | null;
    fasting?: boolean | null;
  };
  processingMetadata: ProcessingMetadata;
  measurements: EvaluatedMeasurement[];
  explanations: MeasurementExplanation[];
  safetyAlerts: SafetyAlert[];
  consultationPrep: DoctorConsultationPrep;
  sourceKnowledgeDocuments: MedicalKnowledgeCitation[];
}

export function runReportAssemblyAgent(input: AssemblyInput): ReportAnalysis {
  return {
    reportId: input.reportId,
    userId: input.userId,
    createdAt: new Date().toISOString(),
    reportDate: input.reportDate,
    labName: input.labName,
    patientContextProvided: {
      age: input.patientContextProvided?.age ?? null,
      gender: input.patientContextProvided?.gender ?? null,
      fasting: input.patientContextProvided?.fasting ?? null
    },
    processingMetadata: input.processingMetadata,
    measurements: input.measurements,
    explanations: input.explanations,
    safetyAlerts: input.safetyAlerts,
    consultationPrep: input.consultationPrep,
    overallDisclaimer: MANDATORY_SAFETY_DISCLAIMER,
    sourceKnowledgeDocuments: input.sourceKnowledgeDocuments
  };
}
