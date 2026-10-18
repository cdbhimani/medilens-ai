import { matchAndCompareReports } from '../src/comparison/historicalMatcher';
import { EvaluatedMeasurement } from '../src/schemas/medicalReportSchema';

describe('Historical Report Comparison Agent', () => {
  const earlierReport: EvaluatedMeasurement[] = [
    {
      id: 'e1',
      testName: 'Fasting Glucose',
      standardizedCode: '1558-6',
      rawValue: '110',
      numericValue: 110,
      valueOperator: 'none',
      unit: 'mg/dL',
      referenceIntervalRaw: '70 - 99',
      referenceIntervalLow: 70,
      referenceIntervalHigh: 99,
      referenceIntervalOperator: 'range',
      evaluationStatus: 'above',
      evaluationReason: 'Above range',
      labAbnormalFlag: 'H',
      specimenType: 'Serum',
      comments: null,
      sourcePage: 1,
      sourceLocationSnippet: '',
      extractionConfidence: 0.99,
      validationIssues: [],
      userVerified: true,
      isAmbiguous: false
    },
    {
      id: 'e2',
      testName: 'Hemoglobin',
      standardizedCode: '718-7',
      rawValue: '13.0',
      numericValue: 13.0,
      valueOperator: 'none',
      unit: 'g/dL',
      referenceIntervalRaw: '12.0 - 15.5',
      referenceIntervalLow: 12.0,
      referenceIntervalHigh: 15.5,
      referenceIntervalOperator: 'range',
      evaluationStatus: 'within',
      evaluationReason: 'Within range',
      labAbnormalFlag: null,
      specimenType: 'Blood',
      comments: null,
      sourcePage: 1,
      sourceLocationSnippet: '',
      extractionConfidence: 0.99,
      validationIssues: [],
      userVerified: true,
      isAmbiguous: false
    }
  ];

  const newerReport: EvaluatedMeasurement[] = [
    {
      id: 'n1',
      testName: 'Glucose, Fasting',
      standardizedCode: '1558-6',
      rawValue: '95',
      numericValue: 95,
      valueOperator: 'none',
      unit: 'mg/dL',
      referenceIntervalRaw: '70 - 99',
      referenceIntervalLow: 70,
      referenceIntervalHigh: 99,
      referenceIntervalOperator: 'range',
      evaluationStatus: 'within',
      evaluationReason: 'Within range',
      labAbnormalFlag: null,
      specimenType: 'Serum',
      comments: null,
      sourcePage: 1,
      sourceLocationSnippet: '',
      extractionConfidence: 0.99,
      validationIssues: [],
      userVerified: true,
      isAmbiguous: false
    },
    {
      id: 'n2',
      testName: 'Hgb',
      standardizedCode: '718-7',
      rawValue: '14.0',
      numericValue: 14.0,
      valueOperator: 'none',
      unit: 'g/dL',
      referenceIntervalRaw: '12.0 - 15.5',
      referenceIntervalLow: 12.0,
      referenceIntervalHigh: 15.5,
      referenceIntervalOperator: 'range',
      evaluationStatus: 'within',
      evaluationReason: 'Within range',
      labAbnormalFlag: null,
      specimenType: 'Blood',
      comments: null,
      sourcePage: 1,
      sourceLocationSnippet: '',
      extractionConfidence: 0.99,
      validationIssues: [],
      userVerified: true,
      isAmbiguous: false
    }
  ];

  test('matches tests by standardized code and alias names', () => {
    const comparisons = matchAndCompareReports('2024-06-01', earlierReport, '2024-10-01', newerReport);
    expect(comparisons.length).toBe(2);

    const glucoseComp = comparisons.find(c => c.testName.toLowerCase().includes('glucose'));
    expect(glucoseComp).toBeDefined();
    expect(glucoseComp?.earlierValue).toBe(110);
    expect(glucoseComp?.newerValue).toBe(95);
    expect(glucoseComp?.absoluteChange).toBe(-15);
    expect(glucoseComp?.percentChange).toBeCloseTo(-13.6, 1);
    expect(glucoseComp?.isComparable).toBe(true);

    const hgbComp = comparisons.find(c => c.testName.toLowerCase().includes('hgb'));
    expect(hgbComp).toBeDefined();
    expect(hgbComp?.earlierValue).toBe(13.0);
    expect(hgbComp?.newerValue).toBe(14.0);
    expect(hgbComp?.absoluteChange).toBe(1.0);
    expect(hgbComp?.percentChange).toBeCloseTo(7.7, 1);
  });

  test('maintains clinical neutrality in trend descriptions', () => {
    const comparisons = matchAndCompareReports('2024-06-01', earlierReport, '2024-10-01', newerReport);
    for (const comp of comparisons) {
      expect(comp.trendDescription).not.toMatch(/cured|healed|worsened|improved/i);
      expect(comp.trendDescription).toMatch(/numerical (increase|decrease)|remained unchanged/i);
    }
  });
});
