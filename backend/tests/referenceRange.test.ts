import { evaluateReferenceRange } from '../src/agents/referenceRangeAgent';
import { ExtractedMeasurement } from '../src/schemas/medicalReportSchema';

describe('Deterministic Reference Range Evaluation Agent', () => {
  const baseMeasurement: ExtractedMeasurement = {
    id: 'test-1',
    testName: 'Hemoglobin',
    rawValue: '14.2',
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
    extractionConfidence: 0.99,
    validationIssues: [],
    userVerified: true,
    isAmbiguous: false
  };

  test('correctly evaluates normal value within standard range', () => {
    const res = evaluateReferenceRange(baseMeasurement);
    expect(res.evaluationStatus).toBe('within');
  });

  test('correctly evaluates below standard range', () => {
    const res = evaluateReferenceRange({
      ...baseMeasurement,
      rawValue: '10.5',
      numericValue: 10.5
    });
    expect(res.evaluationStatus).toBe('below');
  });

  test('correctly evaluates above standard range', () => {
    const res = evaluateReferenceRange({
      ...baseMeasurement,
      rawValue: '17.8',
      numericValue: 17.8
    });
    expect(res.evaluationStatus).toBe('above');
  });

  test('correctly handles boundary values [low boundary]', () => {
    const res = evaluateReferenceRange({
      ...baseMeasurement,
      rawValue: '12.0',
      numericValue: 12.0
    });
    expect(res.evaluationStatus).toBe('within');
  });

  test('correctly handles boundary values [high boundary]', () => {
    const res = evaluateReferenceRange({
      ...baseMeasurement,
      rawValue: '15.5',
      numericValue: 15.5
    });
    expect(res.evaluationStatus).toBe('within');
  });

  test('correctly handles open-ended interval (< 200)', () => {
    const normalRes = evaluateReferenceRange({
      ...baseMeasurement,
      testName: 'Total Cholesterol',
      rawValue: '185',
      numericValue: 185,
      unit: 'mg/dL',
      referenceIntervalRaw: '< 200',
      referenceIntervalLow: null,
      referenceIntervalHigh: 200,
      referenceIntervalOperator: '<'
    });
    expect(normalRes.evaluationStatus).toBe('within');

    const highRes = evaluateReferenceRange({
      ...baseMeasurement,
      testName: 'Total Cholesterol',
      rawValue: '220',
      numericValue: 220,
      unit: 'mg/dL',
      referenceIntervalRaw: '< 200',
      referenceIntervalLow: null,
      referenceIntervalHigh: 200,
      referenceIntervalOperator: '<'
    });
    expect(highRes.evaluationStatus).toBe('above');
  });

  test('correctly handles open-ended interval (> 40 for HDL)', () => {
    const normalRes = evaluateReferenceRange({
      ...baseMeasurement,
      testName: 'HDL Cholesterol',
      rawValue: '55',
      numericValue: 55,
      unit: 'mg/dL',
      referenceIntervalRaw: '> 40',
      referenceIntervalLow: 40,
      referenceIntervalHigh: null,
      referenceIntervalOperator: '>'
    });
    expect(normalRes.evaluationStatus).toBe('within');

    const lowRes = evaluateReferenceRange({
      ...baseMeasurement,
      testName: 'HDL Cholesterol',
      rawValue: '32',
      numericValue: 32,
      unit: 'mg/dL',
      referenceIntervalRaw: '> 40',
      referenceIntervalLow: 40,
      referenceIntervalHigh: null,
      referenceIntervalOperator: '>'
    });
    expect(lowRes.evaluationStatus).toBe('below');
  });

  test('returns indeterminate for missing reference interval', () => {
    const res = evaluateReferenceRange({
      ...baseMeasurement,
      referenceIntervalRaw: 'Not provided',
      referenceIntervalLow: null,
      referenceIntervalHigh: null,
      referenceIntervalOperator: 'none'
    });
    expect(res.evaluationStatus).toBe('indeterminate');
  });

  test('evaluates qualitative Negative test as within range', () => {
    const res = evaluateReferenceRange({
      ...baseMeasurement,
      testName: 'Hepatitis B Surface Antigen',
      rawValue: 'Negative',
      numericValue: null,
      referenceIntervalRaw: 'Negative',
      referenceIntervalLow: null,
      referenceIntervalHigh: null,
      referenceIntervalOperator: 'textual'
    });
    expect(res.evaluationStatus).toBe('within');
  });
});
