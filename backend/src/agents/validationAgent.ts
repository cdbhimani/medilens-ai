import { ExtractedMeasurement } from '../schemas/medicalReportSchema';

export interface ValidationResult {
  validatedMeasurements: ExtractedMeasurement[];
  hasMaterialAmbiguity: boolean;
  ambiguitiesCount: number;
  validationWarnings: string[];
}

export function runValidationAgent(measurements: ExtractedMeasurement[]): ValidationResult {
  const validatedMeasurements: ExtractedMeasurement[] = [];
  const validationWarnings: string[] = [];
  const seenTests = new Map<string, ExtractedMeasurement>();
  let ambiguitiesCount = 0;

  for (const m of measurements) {
    const issues: string[] = [...(m.validationIssues || [])];
    let isAmbiguous = m.isAmbiguous || false;

    // Rule 1: Check for empty or missing test name
    if (!m.testName || m.testName.trim() === '') {
      issues.push('Missing or empty test name.');
      isAmbiguous = true;
    }

    // Rule 2: Low confidence OCR detection (< 0.75)
    if (m.extractionConfidence < 0.75) {
      issues.push(`Low OCR extraction confidence (${Math.round(m.extractionConfidence * 100)}%). Verification against original source document is recommended.`);
      isAmbiguous = true;
    }

    // Rule 3: Malformed reference intervals (low > high)
    if (m.referenceIntervalLow !== null && m.referenceIntervalHigh !== null) {
      if (m.referenceIntervalLow > m.referenceIntervalHigh) {
        issues.push(`Inverted laboratory reference range [${m.referenceIntervalLow} - ${m.referenceIntervalHigh}]. Stated minimum exceeds maximum.`);
      }
    }

    // Rule 4: Physiological plausibility sanity checks (flagging severe anomalies for human review)
    if (m.numericValue !== null && !isNaN(m.numericValue)) {
      if (m.numericValue < 0 && !m.testName.toLowerCase().includes('base excess')) {
        issues.push(`Negative numeric value (${m.numericValue}) is biologically unusual for this test type.`);
        isAmbiguous = true;
      }

      const testLower = m.testName.toLowerCase();
      if ((testLower.includes('hemoglobin') || testLower.includes('hgb')) && m.numericValue > 35) {
        issues.push(`Hemoglobin value (${m.numericValue}) exceeds typical biological maximum; verify unit (e.g. g/L vs g/dL).`);
      }
      if (testLower.includes('potassium') && m.numericValue > 15) {
        issues.push(`Potassium value (${m.numericValue}) exceeds typical biological limits; potential laboratory artifact or hemolysis.`);
      }
    }

    // Rule 5: Duplicate test name detection
    const normalizedKey = m.testName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenTests.has(normalizedKey)) {
      const prior = seenTests.get(normalizedKey)!;
      if (prior.rawValue !== m.rawValue) {
        issues.push(`Duplicate report entry detected for "${m.testName}" with conflicting values ("${prior.rawValue}" vs "${m.rawValue}").`);
        validationWarnings.push(`Conflicting duplicate test: ${m.testName}`);
        isAmbiguous = true;
      } else {
        issues.push(`Duplicate row for "${m.testName}" detected in report.`);
      }
    } else {
      seenTests.set(normalizedKey, m);
    }

    if (isAmbiguous) {
      ambiguitiesCount++;
    }

    validatedMeasurements.push({
      ...m,
      validationIssues: issues,
      isAmbiguous
    });
  }

  return {
    validatedMeasurements,
    hasMaterialAmbiguity: ambiguitiesCount > 0,
    ambiguitiesCount,
    validationWarnings
  };
}
