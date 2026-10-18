import express, { Request, Response } from 'express';
import { getGeminiService } from '../services/geminiService';
import { CURATED_MEDICAL_KNOWLEDGE } from '../rag/seedData';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  const gemini = getGeminiService();
  res.json({
    status: 'healthy',
    service: 'MediLens AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    components: {
      geminiConfigured: gemini.isConfigured(),
      ragKnowledgeBaseSize: CURATED_MEDICAL_KNOWLEDGE.length,
      demoModeAvailable: true
    }
  });
});

export default router;
