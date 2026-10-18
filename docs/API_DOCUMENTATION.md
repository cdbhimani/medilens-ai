# MediLens AI — Backend API Documentation

All protected endpoints require an `Authorization` header formatted as:
`Authorization: Bearer <TOKEN>`

---

## 1. Health & Status Endpoints

### `GET /health` and `GET /api/health`
Returns service readiness and integrated subsystem status.
- **Authentication**: None required.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "MediLens AI Backend",
  "version": "1.0.0",
  "uptimeSeconds": 142,
  "components": {
    "geminiConfigured": true,
    "ragKnowledgeBaseSize": 10,
    "demoModeAvailable": true
  }
}
```

---

## 2. Report Management Endpoints

### `POST /api/reports/upload`
Uploads a medical report document (PDF or image) and executes the full 9-stage agentic workflow.
- **Authentication**: Required (`Bearer <TOKEN>`).
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `reportFile` (Binary file: PDF, JPG, PNG; max 15MB)
  - `consent` (Boolean string: `"true"`)
  - `age` (Optional integer: e.g. `45`)
  - `gender` (Optional string: e.g. `"Female"`)
  - `fasting` (Optional boolean string: `"true"` or `"false"`)
- **Response `201 Created`**:
```json
{
  "message": "Report analyzed successfully.",
  "reportId": "rep_a8b9c0d1e2f3",
  "stagesCompleted": [
    "Stage 1: Document Intake Agent",
    "Stage 2: Extraction Agent (Gemini Multimodal Document Processing)",
    "Stage 3: Validation Agent (0 ambiguities flagged)",
    "Stage 4: Reference-Range Evaluation Agent (Deterministic numerical logic)",
    "Stage 5: Medical Knowledge Retrieval Agent (3 sources matched)",
    "Stage 6: Explanation Agent (Grounded plain-language explanations)",
    "Stage 7: Safety and Triage Agent (1 alerts evaluated)",
    "Stage 8: Consultation Preparation Agent",
    "Stage 9: Report Assembly Agent"
  ],
  "durationMs": 1450,
  "analysis": { ... }
}
```

---

### `GET /api/reports`
Lists all medical reports uploaded by the authenticated user.
- **Authentication**: Required.
- **Response `200 OK`**:
```json
{
  "reports": [
    {
      "reportId": "rep_a8b9c0d1e2f3",
      "reportDate": "2024-09-15",
      "labName": "Metro Diagnostic Laboratories [SYNTHETIC DEMO]",
      "createdAt": "2024-10-15T11:45:00.000Z",
      "fileName": "demo-cbc-standard.pdf",
      "testCount": 4,
      "abnormalCount": 2,
      "criticalCount": 0,
      "hasAmbiguities": false
    }
  ]
}
```

---

### `GET /api/reports/:reportId/analysis`
Fetches complete 9-stage analysis, extracted measurements, plain explanations, safety alerts, and doctor questions.
- **Authentication**: Required (owner user only).
- **Response `200 OK`**:
```json
{
  "analysis": {
    "reportId": "rep_a8b9c0d1e2f3",
    "userId": "demo-user",
    "createdAt": "2024-10-15T11:45:00.000Z",
    "reportDate": "2024-09-15",
    "labName": "Metro Diagnostic Laboratories",
    "measurements": [
      {
        "id": "cbc-1",
        "testName": "Hemoglobin",
        "rawValue": "10.8",
        "numericValue": 10.8,
        "unit": "g/dL",
        "referenceIntervalRaw": "12.0 - 15.5",
        "evaluationStatus": "below",
        "evaluationReason": "Value 10.8 is below the laboratory reference interval [12.0 - 15.5] g/dL."
      }
    ],
    "explanations": [
      {
        "testName": "Hemoglobin",
        "plainLanguageSummary": "Your measured value for Hemoglobin is 10.8 g/dL, which is below the laboratory's reported reference interval of 12.0 - 15.5.",
        "citations": [
          {
            "id": "MEDLINE-HGB-01",
            "title": "Hemoglobin Test: MedlinePlus Medical Test",
            "publisher": "U.S. National Library of Medicine (MedlinePlus)",
            "url": "https://medlineplus.gov/lab-tests/hemoglobin-test/"
          }
        ]
      }
    ],
    "safetyAlerts": [ ... ],
    "consultationPrep": {
      "suggestedQuestions": [ ... ],
      "missingContext": [ ... ],
      "reportSummaryText": "This report includes 4 extracted laboratory measurement(s)..."
    },
    "overallDisclaimer": "MediLens AI provides educational information to help you understand medical reports..."
  }
}
```

---

### `POST /api/reports/compare`
Compares two reports across dates with verified unit conversion.
- **Authentication**: Required.
- **Request Body**:
```json
{
  "earlierReportId": "rep_earlier_id",
  "newerReportId": "rep_newer_id"
}
```
- **Response `200 OK`**:
```json
{
  "earlierReportId": "rep_earlier_id",
  "earlierDate": "2024-06-10",
  "newerReportId": "rep_newer_id",
  "newerDate": "2024-10-10",
  "comparisonCount": 3,
  "comparisons": [
    {
      "testName": "Fasting Glucose",
      "earlierValue": 112,
      "earlierUnit": "mg/dL",
      "newerValue": 5.5,
      "newerUnit": "mmol/L",
      "normalizedEarlierValue": 112,
      "normalizedNewerValue": 99.1,
      "normalizedUnit": "mg/dL",
      "absoluteChange": -12.9,
      "percentChange": -11.5,
      "isComparable": true,
      "comparabilityNote": "Newer measurement converted from mmol/L to mg/dL (factor: 18.0182).",
      "trendDescription": "Numerical decrease of 12.9 mg/dL (-11.5%) from 2024-06-10 to 2024-10-10."
    }
  ]
}
```

---

### `GET /api/reports/:reportId/export`
Exports a clean, printable plaintext summary of the report.
- **Authentication**: Required.
- **Response `200 OK`**: `Content-Type: text/plain`

---

### `DELETE /api/reports/:reportId`
Permanently deletes the report record, measurements, and files.
- **Authentication**: Required.
- **Response `200 OK`**:
```json
{
  "message": "Report deleted successfully.",
  "reportId": "rep_a8b9c0d1e2f3"
}
```

---

## 3. Demo Mode Endpoints

### `GET /api/demo/reports`
Lists all 7 pre-configured synthetic demo scenarios.
- **Authentication**: None.

### `POST /api/demo/load/:demoId`
Runs the 9-stage analysis on a synthetic demo report and persists it to the user's dashboard.
- **Authentication**: Required.
