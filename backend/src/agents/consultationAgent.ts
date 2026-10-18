import { EvaluatedMeasurement, SafetyAlert, DoctorConsultationPrep } from '../schemas/medicalReportSchema';

export function runConsultationAgent(
  measurements: EvaluatedMeasurement[],
  safetyAlerts: SafetyAlert[],
  patientContext?: { age?: number | null; gender?: string | null; fasting?: boolean | null }
): DoctorConsultationPrep {
  const suggestedQuestions: string[] = [];
  const missingContext: string[] = [];
  const abnormalMeasurements = measurements.filter(m => m.evaluationStatus === 'above' || m.evaluationStatus === 'below');
  const indeterminateMeasurements = measurements.filter(m => m.evaluationStatus === 'indeterminate');
  const hasCriticalAlerts = safetyAlerts.some(a => a.severity === 'critical' || a.severity === 'emergency');

  // Question generation based on out-of-range results
  if (abnormalMeasurements.length > 0) {
    for (const m of abnormalMeasurements.slice(0, 3)) {
      suggestedQuestions.push(
        `My ${m.testName} was reported as ${m.rawValue} ${m.unit} (${m.evaluationStatus} range). What factors might be contributing to this finding?`
      );
    }
    suggestedQuestions.push('Do these results indicate any need for repeat testing or lifestyle modifications?');
  } else {
    suggestedQuestions.push('All evaluated tests appear within stated reference intervals. How do these align with my general wellness goals?');
    suggestedQuestions.push('When would you recommend scheduled follow-up or routine screening next?');
  }

  if (hasCriticalAlerts) {
    suggestedQuestions.unshift('Important: One or more values triggered a clinical safety alert. Should this be confirmed with an urgent repeat lab draw?');
  }

  if (indeterminateMeasurements.length > 0) {
    suggestedQuestions.push(`For tests without printed reference ranges (${indeterminateMeasurements.map(m => m.testName).join(', ')}), what is your typical clinical target?`);
  }

  // Missing context identification
  const hasMetabolicOrLipid = measurements.some(m => {
    const t = m.testName.toLowerCase();
    return t.includes('glucose') || t.includes('lipid') || t.includes('triglyceride') || t.includes('cholesterol');
  });

  if (hasMetabolicOrLipid && patientContext?.fasting === undefined) {
    missingContext.push('Fasting status was not recorded. Fasting for 8-12 hours is often standard for glucose and lipid panels.');
  }

  if (!patientContext?.age || !patientContext?.gender) {
    missingContext.push('Patient age and biological sex were not provided. Several laboratory reference ranges (such as hemoglobin, hematocrit, creatinine) vary by age and sex.');
  }

  missingContext.push('Current prescription medications, over-the-counter drugs, and herbal supplements were not noted. These can frequently influence liver enzymes, kidney markers, and electrolyte levels.');
  missingContext.push('Current physical symptoms or recent acute illnesses (e.g., dehydration, cold, fever) were not captured.');

  // Summary generation
  const summaryParts: string[] = [];
  summaryParts.push(`This report includes ${measurements.length} extracted laboratory measurement(s).`);
  if (abnormalMeasurements.length > 0) {
    summaryParts.push(
      `${abnormalMeasurements.length} value(s) were outside the laboratory's stated reference interval: ${abnormalMeasurements.map(m => `${m.testName} (${m.rawValue} ${m.unit})`).join(', ')}.`
    );
  } else {
    summaryParts.push('All extracted measurements were within their respective laboratory-stated reference intervals.');
  }

  if (hasCriticalAlerts) {
    summaryParts.push('A clinical safety threshold alert was triggered. Prompt physician review is strongly recommended.');
  }

  const clinicalReviewWarranted = abnormalMeasurements.length > 0 || hasCriticalAlerts || indeterminateMeasurements.length > 0;
  const reviewWarrantedReason = hasCriticalAlerts
    ? 'Critical laboratory threshold detected requiring clinical evaluation.'
    : abnormalMeasurements.length > 0
    ? 'One or more values fall outside laboratory reference intervals.'
    : null;

  return {
    suggestedQuestions,
    missingContext,
    reportSummaryText: summaryParts.join(' '),
    clinicalReviewWarranted,
    reviewWarrantedReason
  };
}
