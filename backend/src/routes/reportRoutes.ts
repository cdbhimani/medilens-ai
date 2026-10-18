import express, { Response } from 'express';
import multer from 'multer';
import { AuthenticatedRequest, authenticateToken } from '../auth/firebaseAuth';
import { orchestrateReportAnalysis } from '../agents/orchestrator';
import { reportStore } from '../storage/localStore';
import { matchAndCompareReports } from '../comparison/historicalMatcher';

const router = express.Router();

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  }
});

// All report routes require authentication
router.use(authenticateToken);

/**
 * POST /api/reports/upload
 * Uploads a medical report and runs the full 9-stage agentic workflow.
 */
router.post('/upload', upload.single('reportFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    const consent = req.body.consent === 'true' || req.body.consent === true;
    const userId = req.user!.uid;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded. Please attach a PDF or image file.' });
      return;
    }

    if (!consent) {
      res.status(400).json({ error: 'Explicit user consent is required before processing sensitive health records.' });
      return;
    }

    const patientContext = {
      age: req.body.age ? Number(req.body.age) : null,
      gender: req.body.gender || null,
      fasting: req.body.fasting !== undefined ? req.body.fasting === 'true' : null
    };

    const orchestrationResult = await orchestrateReportAnalysis({
      intakeInput: {
        fileName: file.originalname,
        fileBuffer: file.buffer,
        fileMimeType: file.mimetype,
        fileSize: file.size,
        userConsentGiven: consent,
        userId
      },
      patientContext
    });

    if (!orchestrationResult.success || !orchestrationResult.analysis) {
      res.status(422).json({
        error: orchestrationResult.error || 'Failed to analyze report.',
        stagesCompleted: orchestrationResult.stagesCompleted
      });
      return;
    }

    // Persist analysis in store
    reportStore.saveReport(orchestrationResult.analysis);

    res.status(201).json({
      message: 'Report analyzed successfully.',
      reportId: orchestrationResult.analysis.reportId,
      analysis: orchestrationResult.analysis,
      stagesCompleted: orchestrationResult.stagesCompleted,
      durationMs: orchestrationResult.durationMs
    });
  } catch (err: any) {
    res.status(500).json({ error: `Server error during upload: ${err.message}` });
  }
});

/**
 * GET /api/reports
 * Returns list of user's uploaded reports.
 */
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.uid;
  const reports = reportStore.listReports(userId);
  const summaryList = reports.map(r => ({
    reportId: r.reportId,
    reportDate: r.reportDate,
    labName: r.labName,
    createdAt: r.createdAt,
    fileName: r.processingMetadata.fileName,
    testCount: r.measurements.length,
    abnormalCount: r.measurements.filter(m => m.evaluationStatus === 'above' || m.evaluationStatus === 'below').length,
    criticalCount: r.safetyAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length,
    hasAmbiguities: r.measurements.some(m => m.isAmbiguous)
  }));
  res.json({ reports: summaryList });
});

/**
 * GET /api/reports/:reportId
 * Returns metadata and measurements for a single report.
 */
router.get('/:reportId', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.uid;
  const report = reportStore.getReport(req.params.reportId, userId);
  if (!report) {
    res.status(404).json({ error: 'Report not found or access denied.' });
    return;
  }
  res.json({ report });
});

/**
 * GET /api/reports/:reportId/analysis
 * Returns complete analysis for a single report.
 */
router.get('/:reportId/analysis', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.uid;
  const report = reportStore.getReport(req.params.reportId, userId);
  if (!report) {
    res.status(404).json({ error: 'Report not found or access denied.' });
    return;
  }
  res.json({ analysis: report });
});

/**
 * POST /api/reports/compare
 * Compares two reports for trend analysis.
 */
router.post('/compare', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.uid;
  const { earlierReportId, newerReportId } = req.body;

  if (!earlierReportId || !newerReportId) {
    res.status(400).json({ error: 'Both earlierReportId and newerReportId must be specified.' });
    return;
  }

  const earlierReport = reportStore.getReport(earlierReportId, userId);
  const newerReport = reportStore.getReport(newerReportId, userId);

  if (!earlierReport || !newerReport) {
    res.status(404).json({ error: 'One or both reports could not be found or access was denied.' });
    return;
  }

  const earlierDate = earlierReport.reportDate || earlierReport.createdAt.split('T')[0];
  const newerDate = newerReport.reportDate || newerReport.createdAt.split('T')[0];

  const comparisonItems = matchAndCompareReports(
    earlierDate,
    earlierReport.measurements,
    newerDate,
    newerReport.measurements
  );

  res.json({
    earlierReportId,
    earlierDate,
    newerReportId,
    newerDate,
    comparisonCount: comparisonItems.length,
    comparisons: comparisonItems
  });
});

/**
 * GET /api/reports/:reportId/export
 * Exports readable text summary suitable for saving or printing.
 */
router.get('/:reportId/export', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.uid;
  const report = reportStore.getReport(req.params.reportId, userId);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const exportText = `
===================================================================
MEDILENS AI — MEDICAL REPORT SUMMARY
===================================================================
Report ID: ${report.reportId}
Date of Report: ${report.reportDate || 'Not specified'}
Laboratory: ${report.labName || 'Not specified'}
Generated On: ${report.createdAt}

MANDATORY CLINICAL SAFETY DISCLAIMER:
${report.overallDisclaimer}

-------------------------------------------------------------------
REPORT SUMMARY:
-------------------------------------------------------------------
${report.consultationPrep.reportSummaryText}

-------------------------------------------------------------------
EXTRACTED MEASUREMENTS & LABORATORY REFERENCE RANGES:
-------------------------------------------------------------------
${report.measurements.map(m => `* ${m.testName}: ${m.rawValue} ${m.unit} | Reference Range: ${m.referenceIntervalRaw} | Evaluation: ${m.evaluationStatus.toUpperCase()}`).join('\n')}

-------------------------------------------------------------------
SAFETY ALERTS & CLINICAL TRIAGE:
-------------------------------------------------------------------
${report.safetyAlerts.map(a => `[${a.severity.toUpperCase()}] ${a.title}\n${a.message}\nRecommended Action: ${a.recommendedAction}\nRule Source: ${a.ruleSource}\n`).join('\n')}

-------------------------------------------------------------------
SUGGESTED QUESTIONS FOR YOUR DOCTOR:
-------------------------------------------------------------------
${report.consultationPrep.suggestedQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

-------------------------------------------------------------------
MISSING CLINICAL CONTEXT:
-------------------------------------------------------------------
${report.consultationPrep.missingContext.map(c => `- ${c}`).join('\n')}

===================================================================
`.trim();

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="MediLens_${report.reportId}.txt"`);
  res.send(exportText);
});

/**
 * DELETE /api/reports/:reportId
 * Deletes user report and associated records.
 */
router.delete('/:reportId', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.uid;
  const deleted = reportStore.deleteReport(req.params.reportId, userId);
  if (!deleted) {
    res.status(404).json({ error: 'Report not found or unauthorized.' });
    return;
  }
  res.json({ message: 'Report deleted successfully.', reportId: req.params.reportId });
});

export default router;
