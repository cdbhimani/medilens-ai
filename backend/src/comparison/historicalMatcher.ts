import { EvaluatedMeasurement, HistoricalComparisonItem } from '../schemas/medicalReportSchema';
import { checkAndConvertUnits } from './unitConverter';

const ALIAS_GROUPS: string[][] = [
  ['hemoglobin', 'hgb', 'hb'],
  ['hematocrit', 'hct'],
  ['white blood cell count', 'wbc', 'leukocyte count', 'white blood cells'],
  ['platelets', 'platelet count', 'plt'],
  ['fasting glucose', 'glucose', 'blood sugar', 'glucose, fasting', 'serum glucose'],
  ['total cholesterol', 'cholesterol', 'cholesterol, total'],
  ['ldl cholesterol', 'ldl', 'ldl-c', 'cholesterol, ldl'],
  ['hdl cholesterol', 'hdl', 'hdl-c', 'cholesterol, hdl'],
  ['triglycerides', 'triglyceride'],
  ['creatinine', 'serum creatinine'],
  ['blood urea nitrogen', 'bun', 'urea nitrogen'],
  ['sodium', 'serum sodium', 'na', 'na+'],
  ['potassium', 'serum potassium', 'k', 'k+'],
  ['chloride', 'serum chloride', 'cl', 'cl-'],
  ['calcium', 'serum calcium', 'ca', 'ca++'],
  ['alt', 'alanine aminotransferase', 'sgpt'],
  ['ast', 'aspartate aminotransferase', 'sgot'],
  ['total bilirubin', 'bilirubin, total', 't. bilirubin']
];

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findMatchingAliasGroup(name: string): number {
  const norm = name.toLowerCase().trim();
  return ALIAS_GROUPS.findIndex(group => 
    group.some(alias => norm === alias || norm.includes(alias) || alias.includes(norm))
  );
}

export function matchAndCompareReports(
  earlierDate: string,
  earlierMeasurements: EvaluatedMeasurement[],
  newerDate: string,
  newerMeasurements: EvaluatedMeasurement[]
): HistoricalComparisonItem[] {
  const comparisonItems: HistoricalComparisonItem[] = [];

  for (const newerM of newerMeasurements) {
    if (newerM.numericValue === null || isNaN(newerM.numericValue)) {
      continue;
    }

    const newerGroupIdx = findMatchingAliasGroup(newerM.testName);

    // Look for matching earlier measurement
    const earlierM = earlierMeasurements.find(earlier => {
      if (earlier.numericValue === null || isNaN(earlier.numericValue)) return false;
      
      // Match by standardized code if present
      if (earlier.standardizedCode && newerM.standardizedCode && earlier.standardizedCode === newerM.standardizedCode) {
        return true;
      }

      // Match by alias group
      if (newerGroupIdx !== -1) {
        const earlierGroupIdx = findMatchingAliasGroup(earlier.testName);
        if (earlierGroupIdx === newerGroupIdx) return true;
      }

      // Match by normalized name
      return normalizeName(earlier.testName) === normalizeName(newerM.testName);
    });

    if (earlierM && earlierM.numericValue !== null) {
      const conversion = checkAndConvertUnits(
        newerM.testName,
        earlierM.numericValue,
        earlierM.unit,
        newerM.numericValue,
        newerM.unit
      );

      let absoluteChange: number | null = null;
      let percentChange: number | null = null;
      let trendDescription = '';

      if (conversion.compatible) {
        absoluteChange = Number((conversion.convertedNewerValue - conversion.convertedEarlierValue).toFixed(2));
        if (conversion.convertedEarlierValue !== 0) {
          percentChange = Number(((absoluteChange / Math.abs(conversion.convertedEarlierValue)) * 100).toFixed(1));
        }

        if (absoluteChange > 0) {
          trendDescription = `Numerical increase of ${absoluteChange} ${conversion.normalizedUnit} (+${percentChange}%) from ${earlierDate} to ${newerDate}. Clinical significance depends on your individual health context and doctor's evaluation.`;
        } else if (absoluteChange < 0) {
          trendDescription = `Numerical decrease of ${Math.abs(absoluteChange)} ${conversion.normalizedUnit} (${percentChange}%) from ${earlierDate} to ${newerDate}. Changes should be interpreted in clinical context.`;
        } else {
          trendDescription = `Value remained unchanged at ${conversion.convertedNewerValue} ${conversion.normalizedUnit} between ${earlierDate} and ${newerDate}.`;
        }
      } else {
        trendDescription = `Direct numerical trend could not be calculated: ${conversion.note}`;
      }

      comparisonItems.push({
        testName: newerM.testName,
        standardizedCode: newerM.standardizedCode || earlierM.standardizedCode || null,
        earlierDate,
        earlierValue: earlierM.numericValue,
        earlierUnit: earlierM.unit,
        newerDate,
        newerValue: newerM.numericValue,
        newerUnit: newerM.unit,
        normalizedEarlierValue: conversion.convertedEarlierValue,
        normalizedNewerValue: conversion.convertedNewerValue,
        normalizedUnit: conversion.normalizedUnit,
        absoluteChange,
        percentChange,
        isComparable: conversion.compatible,
        comparabilityNote: conversion.note,
        trendDescription
      });
    }
  }

  return comparisonItems;
}
