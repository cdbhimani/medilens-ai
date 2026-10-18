import express, { Response } from 'express';
import { SYNTHETIC_DEMO_REPORTS } from '../demo/syntheticReports';
import { AuthenticatedRequest, authenticateToken } from '../auth/firebaseAuth';
import { orchestrateReportAnalysis } from '../agents/orchestrator';
import { reportStore } from '../storage/localStore';

const router = express.Router();

/**
 * GET /api/demo/reports
 * Lists all available synthetic demo reports with descriptions.
 * Publicly viewable for demonstration onboarding.
 */
router.get('/reports', (_req, res: Response) => {
  const summaries = SYNTHETIC_DEMO_REPORTS.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    category: d.category,
    reportDate: d.reportDate,
    labName: d.labName,
    testCount: d.measurements.length
  }));
  res.json({ demoReports: summaries });
});

/**
 * POST /api/demo/load/:demoId
 * Instantly loads and runs the full 9-stage analysis on a synthetic demo report.
 * Requires auth token (supports guest/demo tokens).
 */
router.post('/load/:demoId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const demo = SYNTHETIC_DEMO_REPORTS.find(d => d.id === req.params.demoId);
  if (!demo) {
    res.status(404).json({ error: `Demo report "${req.params.demoId}" not found.` });
    return;
  }

  const userId = req.user!.uid;

  const orchestrationResult = await orchestrateReportAnalysis({
    intakeInput: {
      fileName: `${demo.id}.pdf`,
      fileMimeType: 'application/pdf',
      fileSize: 1024 * 150,
      userConsentGiven: true,
      userId
    },
    preloadedMeasurements: demo.measurements,
    preloadedReportDate: demo.reportDate,
    preloadedLabName: demo.labName,
    patientContext: {
      age: 45,
      gender: 'Demo Profile',
      fasting: demo.category === 'cmp' || demo.category === 'historical_baseline'
    }
  });

  if (!orchestrationResult.success || !orchestrationResult.analysis) {
    res.status(500).json({ error: 'Failed to process synthetic demo report.' });
    return;
  }

  // Persist demo report to user storage
  reportStore.saveReport(orchestrationResult.analysis);

  res.status(201).json({
    message: `Loaded synthetic demo report "${demo.name}".`,
    reportId: orchestrationResult.analysis.reportId,
    analysis: orchestrationResult.analysis,
    stagesCompleted: orchestrationResult.stagesCompleted,
    durationMs: orchestrationResult.durationMs
  });
});

export default router;
