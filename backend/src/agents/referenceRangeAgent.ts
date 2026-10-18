import { ExtractedMeasurement, EvaluatedMeasurement } from '../schemas/medicalReportSchema';

/**
 * Deterministic Reference Range Evaluation Agent
 * Uses deterministic code for numerical comparisons, never guessing or hallucinating ranges.
 */
export function evaluateReferenceRange(measurement: ExtractedMeasurement): EvaluatedMeasurement {
  const { rawValue, numericValue, referenceIntervalRaw, referenceIntervalLow, referenceIntervalHigh, referenceIntervalOperator } = measurement;

  // Case 1: Missing or unparseable numeric measurement value
  if (numericValue === null || isNaN(numericValue)) {
    // Check if qualitative (e.g. Negative, Non-reactive)
    const lowerRaw = rawValue.toLowerCase().trim();
    const lowerRef = referenceIntervalRaw.toLowerCase().trim();
    if (lowerRef.includes('negative') || lowerRef.includes('non-reactive') || lowerRef.includes('normal')) {
      if (lowerRaw === 'negative' || lowerRaw === 'non-reactive' || lowerRaw === 'normal') {
        return {
          ...measurement,
          evaluationStatus: 'within',
          evaluationReason: `Qualitative value "${rawValue}" matches expected reference "${referenceIntervalRaw}".`
        };
      } else if (lowerRaw.includes('positive') || lowerRaw.includes('reactive') || lowerRaw.includes('abnormal')) {
        return {
          ...measurement,
          evaluationStatus: 'above',
          evaluationReason: `Qualitative value "${rawValue}" is outside expected reference "${referenceIntervalRaw}".`
        };
      }
    }

    return {
      ...measurement,
      evaluationStatus: 'indeterminate',
      evaluationReason: `Numeric value could not be determined from "${rawValue}". Reference interval: "${referenceIntervalRaw}".`
    };
  }

  // Case 2: Reference interval is missing or not provided
  if (!referenceIntervalRaw || referenceIntervalRaw.toLowerCase().includes('not provided') || 
      (referenceIntervalLow === null && referenceIntervalHigh === null && referenceIntervalOperator === 'none')) {
    return {
      ...measurement,
      evaluationStatus: 'indeterminate',
      evaluationReason: 'No laboratory reference interval was provided in the report. Clinical review is required.'
    };
  }

  // Case 3: Open-ended interval (e.g. "< 200", "<= 100", "> 40", ">= 60")
  if (referenceIntervalOperator === '<' || referenceIntervalOperator === '<=') {
    const threshold = referenceIntervalHigh ?? referenceIntervalLow;
    if (threshold !== null) {
      if (referenceIntervalOperator === '<') {
        if (numericValue < threshold) {
          return {
            ...measurement,
            evaluationStatus: 'within',
            evaluationReason: `Value ${numericValue} is strictly below the upper threshold of ${threshold} (< ${threshold}).`
          };
        } else {
          return {
            ...measurement,
            evaluationStatus: 'above',
            evaluationReason: `Value ${numericValue} meets or exceeds upper threshold of ${threshold} (< ${threshold}).`
          };
        }
      } else { // <=
        if (numericValue <= threshold) {
          return {
            ...measurement,
            evaluationStatus: 'within',
            evaluationReason: `Value ${numericValue} is within threshold of <= ${threshold}.`
          };
        } else {
          return {
            ...measurement,
            evaluationStatus: 'above',
            evaluationReason: `Value ${numericValue} exceeds upper threshold of ${threshold} (<= ${threshold}).`
          };
        }
      }
    }
  }

  if (referenceIntervalOperator === '>' || referenceIntervalOperator === '>=') {
    const threshold = referenceIntervalLow ?? referenceIntervalHigh;
    if (threshold !== null) {
      if (referenceIntervalOperator === '>') {
        if (numericValue > threshold) {
          return {
            ...measurement,
            evaluationStatus: 'within',
            evaluationReason: `Value ${numericValue} is strictly above lower target of ${threshold} (> ${threshold}).`
          };
        } else {
          return {
            ...measurement,
            evaluationStatus: 'below',
            evaluationReason: `Value ${numericValue} meets or is below the lower target of ${threshold} (> ${threshold}).`
          };
        }
      } else { // >=
        if (numericValue >= threshold) {
          return {
            ...measurement,
            evaluationStatus: 'within',
            evaluationReason: `Value ${numericValue} meets the lower target of >= ${threshold}.`
          };
        } else {
          return {
            ...measurement,
            evaluationStatus: 'below',
            evaluationReason: `Value ${numericValue} is below the lower target of ${threshold} (>= ${threshold}).`
          };
        }
      }
    }
  }

  // Case 4: Standard two-sided range [low, high]
  if (referenceIntervalLow !== null && referenceIntervalHigh !== null) {
    if (numericValue < referenceIntervalLow) {
      return {
        ...measurement,
        evaluationStatus: 'below',
        evaluationReason: `Value ${numericValue} is below the laboratory reference interval [${referenceIntervalLow} - ${referenceIntervalHigh}] ${measurement.unit}.`
      };
    } else if (numericValue > referenceIntervalHigh) {
      return {
        ...measurement,
        evaluationStatus: 'above',
        evaluationReason: `Value ${numericValue} is above the laboratory reference interval [${referenceIntervalLow} - ${referenceIntervalHigh}] ${measurement.unit}.`
      };
    } else {
      return {
        ...measurement,
        evaluationStatus: 'within',
        evaluationReason: `Value ${numericValue} is within the laboratory reference interval [${referenceIntervalLow} - ${referenceIntervalHigh}] ${measurement.unit}.`
      };
    }
  }

  // Fallback: If only low is provided
  if (referenceIntervalLow !== null && referenceIntervalHigh === null) {
    if (numericValue < referenceIntervalLow) {
      return {
        ...measurement,
        evaluationStatus: 'below',
        evaluationReason: `Value ${numericValue} is below the stated minimum of ${referenceIntervalLow} ${measurement.unit}.`
      };
    }
    return {
      ...measurement,
      evaluationStatus: 'within',
      evaluationReason: `Value ${numericValue} meets the stated minimum of ${referenceIntervalLow} ${measurement.unit}.`
    };
  }

  // Fallback: If only high is provided
  if (referenceIntervalHigh !== null && referenceIntervalLow === null) {
    if (numericValue > referenceIntervalHigh) {
      return {
        ...measurement,
        evaluationStatus: 'above',
        evaluationReason: `Value ${numericValue} is above the stated maximum of ${referenceIntervalHigh} ${measurement.unit}.`
      };
    }
    return {
      ...measurement,
      evaluationStatus: 'within',
      evaluationReason: `Value ${numericValue} is within the stated maximum of ${referenceIntervalHigh} ${measurement.unit}.`
    };
  }

  return {
    ...measurement,
    evaluationStatus: 'indeterminate',
    evaluationReason: `Unable to evaluate reference range "${referenceIntervalRaw}" against numeric value ${numericValue}.`
  };
}

export function evaluateAllMeasurements(measurements: ExtractedMeasurement[]): EvaluatedMeasurement[] {
  return measurements.map(evaluateReferenceRange);
}
