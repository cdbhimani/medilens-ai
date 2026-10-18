import { EvaluatedMeasurement, SafetyAlert } from '../schemas/medicalReportSchema';
import { runDeterministicSafetyTriage } from '../safety/criticalRules';

export function runSafetyAgent(measurements: EvaluatedMeasurement[]): SafetyAlert[] {
  return runDeterministicSafetyTriage(measurements);
}
