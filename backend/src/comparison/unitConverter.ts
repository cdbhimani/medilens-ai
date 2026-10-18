export interface ConversionRule {
  fromUnit: string;
  toUnit: string;
  convert: (val: number) => number;
}

export interface UnitCompatibilityResult {
  compatible: boolean;
  convertedEarlierValue: number;
  convertedNewerValue: number;
  normalizedUnit: string;
  note: string;
}

const normalizeUnitString = (u: string) => u.toLowerCase().replace(/\s+/g, '').replace('µ', 'u');

export function checkAndConvertUnits(
  testName: string,
  earlierVal: number,
  earlierUnit: string,
  newerVal: number,
  newerUnit: string
): UnitCompatibilityResult {
  const normEarlierUnit = normalizeUnitString(earlierUnit);
  const normNewerUnit = normalizeUnitString(newerUnit);
  const normTest = testName.toLowerCase();

  // Case 1: Identical units
  if (normEarlierUnit === normNewerUnit) {
    return {
      compatible: true,
      convertedEarlierValue: earlierVal,
      convertedNewerValue: newerVal,
      normalizedUnit: earlierUnit,
      note: 'Units match directly.'
    };
  }

  // Case 2: Hemoglobin (g/dL <-> g/L)
  if (normTest.includes('hemoglobin') || normTest.includes('hgb')) {
    if (normEarlierUnit === 'g/dl' && normNewerUnit === 'g/l') {
      return {
        compatible: true,
        convertedEarlierValue: earlierVal,
        convertedNewerValue: Number((newerVal / 10).toFixed(2)),
        normalizedUnit: 'g/dL',
        note: 'Newer measurement converted from g/L to g/dL (factor: divide by 10).'
      };
    }
    if (normEarlierUnit === 'g/l' && normNewerUnit === 'g/dl') {
      return {
        compatible: true,
        convertedEarlierValue: Number((earlierVal / 10).toFixed(2)),
        convertedNewerValue: newerVal,
        normalizedUnit: 'g/dL',
        note: 'Earlier measurement converted from g/L to g/dL (factor: divide by 10).'
      };
    }
  }

  // Case 3: Glucose (mg/dL <-> mmol/L)
  if (normTest.includes('glucose') || normTest.includes('blood sugar')) {
    if (normEarlierUnit === 'mg/dl' && normNewerUnit === 'mmol/l') {
      return {
        compatible: true,
        convertedEarlierValue: earlierVal,
        convertedNewerValue: Number((newerVal * 18.0182).toFixed(1)),
        normalizedUnit: 'mg/dL',
        note: 'Newer measurement converted from mmol/L to mg/dL (factor: 18.0182).'
      };
    }
    if (normEarlierUnit === 'mmol/l' && normNewerUnit === 'mg/dl') {
      return {
        compatible: true,
        convertedEarlierValue: Number((earlierVal * 18.0182).toFixed(1)),
        convertedNewerValue: newerVal,
        normalizedUnit: 'mg/dL',
        note: 'Earlier measurement converted from mmol/L to mg/dL (factor: 18.0182).'
      };
    }
  }

  // Case 4: Cholesterol (mg/dL <-> mmol/L)
  if (normTest.includes('cholesterol') || normTest.includes('ldl') || normTest.includes('hdl')) {
    if (normEarlierUnit === 'mg/dl' && normNewerUnit === 'mmol/l') {
      return {
        compatible: true,
        convertedEarlierValue: earlierVal,
        convertedNewerValue: Number((newerVal * 38.67).toFixed(1)),
        normalizedUnit: 'mg/dL',
        note: 'Newer measurement converted from mmol/L to mg/dL (factor: 38.67).'
      };
    }
    if (normEarlierUnit === 'mmol/l' && normNewerUnit === 'mg/dl') {
      return {
        compatible: true,
        convertedEarlierValue: Number((earlierVal * 38.67).toFixed(1)),
        convertedNewerValue: newerVal,
        normalizedUnit: 'mg/dL',
        note: 'Earlier measurement converted from mmol/L to mg/dL (factor: 38.67).'
      };
    }
  }

  // Case 5: Creatinine (mg/dL <-> umol/L)
  if (normTest.includes('creatinine')) {
    if (normEarlierUnit === 'mg/dl' && (normNewerUnit === 'umol/l' || normNewerUnit === 'µmol/l')) {
      return {
        compatible: true,
        convertedEarlierValue: earlierVal,
        convertedNewerValue: Number((newerVal / 88.4).toFixed(2)),
        normalizedUnit: 'mg/dL',
        note: 'Newer measurement converted from umol/L to mg/dL (factor: 88.4).'
      };
    }
    if ((normEarlierUnit === 'umol/l' || normEarlierUnit === 'µmol/l') && normNewerUnit === 'mg/dl') {
      return {
        compatible: true,
        convertedEarlierValue: Number((earlierVal / 88.4).toFixed(2)),
        convertedNewerValue: newerVal,
        normalizedUnit: 'mg/dL',
        note: 'Earlier measurement converted from umol/L to mg/dL (factor: 88.4).'
      };
    }
  }

  // Incompatible or unverified conversion
  return {
    compatible: false,
    convertedEarlierValue: earlierVal,
    convertedNewerValue: newerVal,
    normalizedUnit: `${earlierUnit} vs ${newerUnit}`,
    note: `Direct mathematical comparison was not performed because unit conversion between "${earlierUnit}" and "${newerUnit}" is either undefined or method-dependent for this test.`
  };
}
