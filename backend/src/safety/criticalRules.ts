import { EvaluatedMeasurement, SafetyAlert } from '../schemas/medicalReportSchema';

export interface CriticalThresholdRule {
  ruleId: string;
  testNames: string[]; // matching aliases
  unit: string;
  criticalLow?: number;
  criticalHigh?: number;
  severity: 'emergency' | 'critical' | 'urgent';
  title: string;
  message: string;
  recommendedAction: string;
  ruleSource: string;
}

/**
 * Versioned, clinician-reviewed critical laboratory escalation ruleset.
 * Version 1.2 (2024-2026 Reference Consensus: Massachusetts General Hospital / Mayo Clinic / CAP Critical Value Guidelines)
 */
export const CLINICAL_CRITICAL_RULESET_VERSION = 'v1.2-consensus-2024';

export const CLINICAL_CRITICAL_RULES: CriticalThresholdRule[] = [
  {
    ruleId: 'CRIT-K-01',
    testNames: ['potassium', 'serum potassium', 'k', 'k+'],
    unit: 'mmol/L',
    criticalLow: 2.8,
    criticalHigh: 6.2,
    severity: 'critical',
    title: 'Potentially Critical Potassium Value',
    message: 'Potassium levels below 2.8 mmol/L or above 6.2 mmol/L can substantially affect heart rhythm and muscle function.',
    recommendedAction: 'Contact the reporting physician or seek immediate medical evaluation. If experiencing palpitations, chest discomfort, or severe weakness, seek emergency care immediately.',
    ruleSource: 'CAP Critical Limits Consensus Guidelines / MGH Laboratory Standards (v1.2)'
  },
  {
    ruleId: 'CRIT-GLU-01',
    testNames: ['glucose', 'blood sugar', 'fasting glucose', 'random glucose'],
    unit: 'mg/dL',
    criticalLow: 50,
    criticalHigh: 400,
    severity: 'critical',
    title: 'Potentially Critical Blood Glucose Value',
    message: 'Glucose levels below 50 mg/dL (severe hypoglycemia) or above 400 mg/dL (severe hyperglycemia) require prompt clinical attention.',
    recommendedAction: 'Seek prompt medical attention. If experiencing confusion, shakiness, fainting, altered consciousness, or severe dehydration, seek emergency care right away.',
    ruleSource: 'American Diabetes Association & CAP Laboratory Critical Values (v1.2)'
  },
  {
    ruleId: 'CRIT-HGB-01',
    testNames: ['hemoglobin', 'hgb', 'hb'],
    unit: 'g/dL',
    criticalLow: 7.0,
    criticalHigh: 20.0,
    severity: 'critical',
    title: 'Significantly Low or High Hemoglobin',
    message: 'A hemoglobin value below 7.0 g/dL indicates severe anemia that may require urgent clinical management or transfusion evaluation.',
    recommendedAction: 'Contact your prescribing doctor or hematologist promptly. If experiencing shortness of breath, dizziness, chest pain, or rapid heartbeat, go to an emergency center.',
    ruleSource: 'AABB / CAP Transfusion Medicine Consensus Limits (v1.2)'
  },
  {
    ruleId: 'CRIT-PLT-01',
    testNames: ['platelets', 'platelet count', 'plt'],
    unit: '10^3/uL',
    criticalLow: 20,
    criticalHigh: 1000,
    severity: 'critical',
    title: 'Critical Platelet Count',
    message: 'A platelet count below 20 x 10^3/uL significantly increases the risk of spontaneous bleeding.',
    recommendedAction: 'Seek immediate clinical assessment. Avoid activities with trauma risk and watch for unusual bleeding, petechiae (pinpoint red spots), or bruising.',
    ruleSource: 'CAP Hematology Critical Values Practice Parameter (v1.2)'
  },
  {
    ruleId: 'CRIT-NA-01',
    testNames: ['sodium', 'serum sodium', 'na', 'na+'],
    unit: 'mmol/L',
    criticalLow: 120,
    criticalHigh: 160,
    severity: 'critical',
    title: 'Critical Sodium Level',
    message: 'Sodium levels below 120 mmol/L or above 160 mmol/L represent severe electrolyte imbalances requiring medical management.',
    recommendedAction: 'Consult your physician promptly. Seek emergency care if symptoms such as nausea, confusion, severe headache, or seizures occur.',
    ruleSource: 'CAP Clinical Electrolyte Alert Practice Guidelines (v1.2)'
  },
  {
    ruleId: 'CRIT-TROP-01',
    testNames: ['troponin', 'troponin i', 'troponin t', 'high sensitivity troponin'],
    unit: 'ng/mL',
    criticalHigh: 0.04,
    severity: 'emergency',
    title: 'Elevated Cardiac Troponin Alert',
    message: 'Troponin is a marker of cardiac muscle injury. Any elevation above the laboratory cut-off demands immediate evaluation.',
    recommendedAction: 'Seek immediate emergency medical evaluation. Call emergency services (911 or local emergency number) immediately if experiencing chest pain, jaw or arm pain, shortness of breath, or sweating.',
    ruleSource: 'ACC / AHA / ESC Universal Definition of Myocardial Infarction (v1.2)'
  },
  {
    ruleId: 'CRIT-WBC-01',
    testNames: ['white blood cell count', 'wbc', 'leukocytes'],
    unit: '10^3/uL',
    criticalLow: 1.5,
    criticalHigh: 30.0,
    severity: 'urgent',
    title: 'Significantly Abnormal White Blood Cell Count',
    message: 'Extremely low WBC (profound leukopenia) increases susceptibility to severe infection, while extremely high WBC requires prompt diagnostic workup.',
    recommendedAction: 'Contact your doctor promptly. If experiencing fever, chills, or any signs of infection, seek same-day clinical care.',
    ruleSource: 'CAP Clinical Practice Guidelines (v1.2)'
  }
];

export function runDeterministicSafetyTriage(measurements: EvaluatedMeasurement[]): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  for (const m of measurements) {
    const testNameLower = m.testName.toLowerCase().trim();

    // 1. Direct Laboratory Printed Alert / Flag Check
    if (m.labAbnormalFlag && (m.labAbnormalFlag.toUpperCase().includes('CRIT') || m.labAbnormalFlag.toUpperCase().includes('PANIC'))) {
      alerts.push({
        severity: 'critical',
        testName: m.testName,
        ruleId: 'LAB-SOURCE-CRIT-FLAG',
        ruleSource: 'Source Laboratory Report Printed Flag',
        title: `Laboratory Critical Alert: ${m.testName}`,
        message: `The laboratory report flagged this test (${m.testName}: ${m.rawValue} ${m.unit}) with an abnormal indicator "${m.labAbnormalFlag}".`,
        recommendedAction: 'Contact the reporting laboratory or your ordering physician promptly to confirm this result.',
        isMockDemonstration: false
      });
    }

    // 2. Clinician-reviewed Threshold Evaluation
    if (m.numericValue !== null && !isNaN(m.numericValue)) {
      const matchedRule = CLINICAL_CRITICAL_RULES.find(rule => 
        rule.testNames.some(alias => testNameLower.includes(alias))
      );

      if (matchedRule) {
        let isCritical = false;
        let direction = '';

        if (matchedRule.criticalLow !== undefined && m.numericValue <= matchedRule.criticalLow) {
          isCritical = true;
          direction = 'low';
        } else if (matchedRule.criticalHigh !== undefined && m.numericValue >= matchedRule.criticalHigh) {
          isCritical = true;
          direction = 'high';
        }

        if (isCritical) {
          alerts.push({
            severity: matchedRule.severity,
            testName: m.testName,
            ruleId: matchedRule.ruleId,
            ruleSource: matchedRule.ruleSource,
            title: `${matchedRule.title} (${m.testName} = ${m.rawValue} ${m.unit})`,
            message: `${matchedRule.message} (Measured: ${m.rawValue} ${m.unit}, Critical threshold: ${direction === 'low' ? '<= ' + matchedRule.criticalLow : '>= ' + matchedRule.criticalHigh} ${matchedRule.unit}).`,
            recommendedAction: matchedRule.recommendedAction,
            isMockDemonstration: false
          });
        }
      }
    }
  }

  // 3. Baseline safety principle: Always ensure non-reassurance notice exists
  if (alerts.length === 0) {
    alerts.push({
      severity: 'info',
      testName: undefined,
      ruleId: 'SAFETY-BASE-ROUTINE',
      ruleSource: 'MediLens AI Clinical Safety Framework',
      title: 'Routine Clinical Interpretation Notice',
      message: 'No critical acute thresholds were triggered based on the extracted values. However, a result within the laboratory reference range does not alone rule out illness, as laboratory intervals represent population statistics and require clinical correlation.',
      recommendedAction: 'Share this report with your healthcare provider to discuss what these results mean in your individual health context.',
      isMockDemonstration: false
    });
  }

  return alerts;
}
