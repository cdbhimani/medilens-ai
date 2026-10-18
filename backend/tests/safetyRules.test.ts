import { runDeterministicSafetyTriage } from '../src/safety/criticalRules';
import { EvaluatedMeasurement } from '../src/schemas/medicalReportSchema';

describe('Deterministic Safety and Triage Agent', () => {
  const baseEvaluated: EvaluatedMeasurement = {
    id: 'crit-test-1',
    testName: 'Potassium',
    rawValue: '6.5',
    numericValue: 6.5,
    valueOperator: 'none',
    unit: 'mmol/L',
    referenceIntervalRaw: '3.5 - 5.0',
    referenceIntervalLow: 3.5,
    referenceIntervalHigh: 5.0,
    referenceIntervalOperator: 'range',
    evaluationStatus: 'above',
    evaluationReason: 'Above range',
    labAbnormalFlag: null,
    specimenType: 'Serum',
    comments: null,
    sourcePage: 1,
    sourceLocationSnippet: '',
    extractionConfidence: 0.99,
    validationIssues: [],
    userVerified: true,
    isAmbiguous: false
  };

  test('triggers critical alert for severe hyperkalemia (> 6.2 mmol/L)', () => {
    const alerts = runDeterministicSafetyTriage([baseEvaluated]);
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const potassiumAlert = alerts.find(a => a.ruleId === 'CRIT-K-01');
    expect(potassiumAlert).toBeDefined();
    expect(potassiumAlert?.severity).toBe('critical');
    expect(potassiumAlert?.message).toContain('6.2');
  });

  test('triggers critical alert for severe hypoglycemia (< 50 mg/dL)', () => {
    const glucoseMeasurement: EvaluatedMeasurement = {
      ...baseEvaluated,
      id: 'glu-1',
      testName: 'Glucose',
      rawValue: '42',
      numericValue: 42,
      unit: 'mg/dL',
      referenceIntervalRaw: '70 - 99',
      referenceIntervalLow: 70,
      referenceIntervalHigh: 99,
      evaluationStatus: 'below'
    };
    const alerts = runDeterministicSafetyTriage([glucoseMeasurement]);
    const glucoseAlert = alerts.find(a => a.ruleId === 'CRIT-GLU-01');
    expect(glucoseAlert).toBeDefined();
    expect(glucoseAlert?.severity).toBe('critical');
  });

  test('triggers emergency alert for elevated Cardiac Troponin', () => {
    const tropMeasurement: EvaluatedMeasurement = {
      ...baseEvaluated,
      id: 'trop-1',
      testName: 'Cardiac Troponin I',
      rawValue: '0.15',
      numericValue: 0.15,
      unit: 'ng/mL',
      referenceIntervalRaw: '< 0.04',
      referenceIntervalLow: null,
      referenceIntervalHigh: 0.04,
      referenceIntervalOperator: '<',
      evaluationStatus: 'above'
    };
    const alerts = runDeterministicSafetyTriage([tropMeasurement]);
    const tropAlert = alerts.find(a => a.ruleId === 'CRIT-TROP-01');
    expect(tropAlert).toBeDefined();
    expect(tropAlert?.severity).toBe('emergency');
    expect(tropAlert?.recommendedAction).toContain('911');
  });

  test('preserves printed laboratory critical flags', () => {
    const flagMeasurement: EvaluatedMeasurement = {
      ...baseEvaluated,
      numericValue: 4.5,
      rawValue: '4.5',
      labAbnormalFlag: 'CRITICAL HIGH'
    };
    const alerts = runDeterministicSafetyTriage([flagMeasurement]);
    const labAlert = alerts.find(a => a.ruleId === 'LAB-SOURCE-CRIT-FLAG');
    expect(labAlert).toBeDefined();
    expect(labAlert?.ruleSource).toBe('Source Laboratory Report Printed Flag');
  });

  test('provides non-reassurance safety notice when all values are normal', () => {
    const normalMeasurement: EvaluatedMeasurement = {
      ...baseEvaluated,
      rawValue: '4.2',
      numericValue: 4.2,
      evaluationStatus: 'within',
      labAbnormalFlag: null
    };
    const alerts = runDeterministicSafetyTriage([normalMeasurement]);
    expect(alerts.length).toBe(1);
    expect(alerts[0].ruleId).toBe('SAFETY-BASE-ROUTINE');
    expect(alerts[0].message).toContain('does not alone rule out illness');
  });
});
