import request from 'supertest';
import app from '../src/server';

describe('MediLens AI API Routes & User Data Isolation', () => {
  test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('MediLens AI Backend');
  });

  test('GET /api/demo/reports lists available synthetic demo reports', async () => {
    const res = await request(app).get('/api/demo/reports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.demoReports)).toBe(true);
    expect(res.body.demoReports.length).toBe(7);
  });

  test('POST /api/demo/load/:demoId executes full 9-stage analysis and persists report', async () => {
    const res = await request(app)
      .post('/api/demo/load/demo-cbc-standard')
      .set('Authorization', 'Bearer demo-user-alice');

    expect(res.status).toBe(201);
    expect(res.body.reportId).toBeDefined();
    expect(res.body.stagesCompleted.length).toBe(9);
    expect(res.body.analysis.measurements.length).toBe(4);

    const reportId = res.body.reportId;

    // Fetch report as Alice (authorized)
    const aliceRes = await request(app)
      .get(`/api/reports/${reportId}/analysis`)
      .set('Authorization', 'Bearer demo-user-alice');
    expect(aliceRes.status).toBe(200);
    expect(aliceRes.body.analysis.reportId).toBe(reportId);

    // Cross-user isolation: User Bob tries to fetch Alice's report -> 404/denied
    const bobRes = await request(app)
      .get(`/api/reports/${reportId}/analysis`)
      .set('Authorization', 'Bearer demo-user-bob');
    expect(bobRes.status).toBe(404);

    // Alice deletes report
    const delRes = await request(app)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', 'Bearer demo-user-alice');
    expect(delRes.status).toBe(200);

    // Verify report is deleted
    const verifyRes = await request(app)
      .get(`/api/reports/${reportId}`)
      .set('Authorization', 'Bearer demo-user-alice');
    expect(verifyRes.status).toBe(404);
  });
});
