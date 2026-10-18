import { EvaluatedMeasurement, MedicalKnowledgeCitation, MeasurementExplanation } from '../schemas/medicalReportSchema';
import { getGeminiService } from '../services/geminiService';

export async function runExplanationAgent(
  measurements: EvaluatedMeasurement[],
  citationsMap: Map<string, MedicalKnowledgeCitation[]>
): Promise<MeasurementExplanation[]> {
  const gemini = getGeminiService();
  const explanations: MeasurementExplanation[] = [];

  for (const m of measurements) {
    const citations = citationsMap.get(m.id) || [];
    const primaryCitation = citations[0];
    const passage = primaryCitation ? primaryCitation.passage : '';

    let plainSummary = '';
    let highLowReasons = '';
    let whatItMeasures = '';
    let limitations = '';

    if (gemini.isConfigured()) {
      try {
        plainSummary = await gemini.generatePlainExplanation(
          m.testName,
          m.rawValue,
          m.unit,
          m.evaluationStatus,
          m.referenceIntervalRaw,
          passage
        );
      } catch (err) {
        console.warn(`Gemini explanation failed for ${m.testName}, using grounded template:`, err);
      }
    }

    // Grounded fallback template if Gemini was not configured or errored
    if (!plainSummary) {
      if (passage) {
        whatItMeasures = passage.split('.')[0] + '.';
        highLowReasons = `Common factors affecting this test include hydration, diet, biological variations, or related clinical conditions documented in medical literature.`;
        plainSummary = `Your measured value for ${m.testName} is ${m.rawValue} ${m.unit}, which is ${m.evaluationStatus === 'within' ? 'within' : m.evaluationStatus === 'below' ? 'below' : m.evaluationStatus === 'above' ? 'above' : 'evaluated as indeterminate relative to'} the laboratory's reported reference interval of ${m.referenceIntervalRaw}.`;
      } else {
        whatItMeasures = `${m.testName} is a laboratory biomarker.`;
        highLowReasons = 'Multiple clinical and lifestyle factors can influence this result.';
        plainSummary = `${m.testName}: Measured ${m.rawValue} ${m.unit} against laboratory range "${m.referenceIntervalRaw}".`;
      }
    } else {
      whatItMeasures = `Biomarker: ${m.testName}`;
      highLowReasons = `Educational context grounded in ${primaryCitation?.publisher || 'authoritative medical sources'}.`;
    }

    limitations = 'This educational explanation is not a medical diagnosis. Laboratory reference intervals reflect population baselines and must be evaluated alongside clinical history.';

    explanations.push({
      testName: m.testName,
      plainLanguageSummary: plainSummary,
      whatItMeasures,
      potentialHighLowReasons: highLowReasons,
      limitationsAndContext: limitations,
      citations,
      uncertaintyDisclaimer: m.isAmbiguous ? 'Note: OCR extraction confidence was reduced for this measurement. Please verify against your paper report.' : null
    });
  }

  return explanations;
}
