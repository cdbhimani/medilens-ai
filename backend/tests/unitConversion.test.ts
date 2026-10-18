import { checkAndConvertUnits } from '../src/comparison/unitConverter';

describe('Deterministic Unit Converter and Compatibility Checker', () => {
  test('handles identical units without conversion', () => {
    const res = checkAndConvertUnits('Glucose', 100, 'mg/dL', 110, 'mg/dL');
    expect(res.compatible).toBe(true);
    expect(res.convertedEarlierValue).toBe(100);
    expect(res.convertedNewerValue).toBe(110);
    expect(res.normalizedUnit).toBe('mg/dL');
  });

  test('converts Glucose from mmol/L to mg/dL correctly', () => {
    // 5.5 mmol/L * 18.0182 = 99.1 mg/dL
    const res = checkAndConvertUnits('Glucose', 110, 'mg/dL', 5.5, 'mmol/L');
    expect(res.compatible).toBe(true);
    expect(res.convertedEarlierValue).toBe(110);
    expect(res.convertedNewerValue).toBeCloseTo(99.1, 1);
    expect(res.normalizedUnit).toBe('mg/dL');
  });

  test('converts Hemoglobin from g/L to g/dL correctly', () => {
    // 145 g/L / 10 = 14.5 g/dL
    const res = checkAndConvertUnits('Hemoglobin', 13.5, 'g/dL', 145, 'g/L');
    expect(res.compatible).toBe(true);
    expect(res.convertedEarlierValue).toBe(13.5);
    expect(res.convertedNewerValue).toBe(14.5);
    expect(res.normalizedUnit).toBe('g/dL');
  });

  test('converts Total Cholesterol from mmol/L to mg/dL', () => {
    // 5.2 mmol/L * 38.67 = 201.1 mg/dL
    const res = checkAndConvertUnits('Total Cholesterol', 5.2, 'mmol/L', 190, 'mg/dL');
    expect(res.compatible).toBe(true);
    expect(res.convertedEarlierValue).toBeCloseTo(201.1, 1);
    expect(res.convertedNewerValue).toBe(190);
  });

  test('converts Creatinine from umol/L to mg/dL', () => {
    // 88.4 umol/L / 88.4 = 1.0 mg/dL
    const res = checkAndConvertUnits('Creatinine', 1.0, 'mg/dL', 88.4, 'umol/L');
    expect(res.compatible).toBe(true);
    expect(res.convertedNewerValue).toBeCloseTo(1.0, 2);
  });

  test('flags incompatible units rather than inventing a conversion', () => {
    const res = checkAndConvertUnits('Platelet Count', 250, '10^3/uL', 45, '%');
    expect(res.compatible).toBe(false);
    expect(res.note).toContain('Direct mathematical comparison was not performed');
  });
});
