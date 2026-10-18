# MediLens AI — Evaluator Demo Walkthrough

This guide provides a rapid 5-minute evaluation walkthrough demonstrating all core features, safety rules, and RAG retrieval without needing real medical documents or payment details.

---

## Quick Start (Local Prototype)

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs on `http://localhost:3000`*

3. Open `http://localhost:3000` in your browser.

---

## Walkthrough Scenarios

### Scenario 1: Synthetic Complete Blood Count (CBC)
- **Objective**: Demonstrate standard extraction, deterministic reference-range classification, and grounded explanations.
- **Action**: On the Landing Page or Dashboard, under **"Evaluator Demo Mode"**, click **"Load & Analyze Demo"** on **"Synthetic CBC"**.
- **What to Observe**:
  1. The 9-stage pipeline processes the report.
  2. The table shows Hemoglobin (10.8 g/dL) marked as **Below Range** (Blue badge), Hematocrit (33.2%) marked **Below Range**, and Platelets / WBC marked **Within Range** (Green badge).
  3. Clicking "Hemoglobin" displays the plain-language explanation citing MedlinePlus with link and exact quoted literature passage.
  4. Notice the **Consultation Preparation** section auto-generates doctor questions regarding anemia and dietary iron factors.

---

### Scenario 2: Synthetic Comprehensive Metabolic Panel (CMP)
- **Objective**: Demonstrate multi-analyte metabolic panels with fasting context.
- **Action**: Click **"Load & Analyze Demo"** on **"Synthetic CMP"**.
- **What to Observe**:
  1. Evaluates Fasting Glucose (94 mg/dL), Creatinine (0.92 mg/dL), Potassium (4.2 mmol/L), Sodium (139 mmol/L).
  2. All biomarkers are within laboratory reference intervals.
  3. Notice the **Routine Clinical Interpretation Notice**: The safety agent specifically reminds the user that a result within normal range does not alone rule out illness and requires clinician correlation.

---

### Scenario 3: Historical Longitudinal Comparison (Unit Conversion & Safe Deltas)
- **Objective**: Demonstrate multi-date tracking with verified international unit conversion without fabricating trends.
- **Action**:
  1. Load both **"Historical Baseline (June 2024)"** and **"Historical Follow-up (October 2024)"** from the demo selector.
  2. Navigate to **"Compare Trends"** in the top navigation.
  3. Select June 2024 as Baseline and October 2024 as Follow-up. Click **"Compare"**.
- **What to Observe**:
  1. **Glucose**: In June, glucose was reported as `112 mg/dL`. In October, the laboratory reported in SI units: `5.5 mmol/L`.
  2. MediLens AI applies the verified conversion factor ($5.5 \times 18.0182 = 99.1\text{ mg/dL}$) and documents: *"Newer measurement converted from mmol/L to mg/dL"*.
  3. The delta is calculated safely: $-12.9\text{ mg/dL}$ ($-11.5\%$).
  4. The trend description maintains clinical neutrality: *"Numerical decrease of 12.9 mg/dL from 2024-06-10 to 2024-10-10. Clinical context is needed to interpret significance."* (No claim that diabetes is cured).

---

### Scenario 4: Missing Reference Range Handling
- **Objective**: Demonstrate deterministic safety when the testing laboratory omitted a reference interval.
- **Action**: Load **"Synthetic Report: Missing Reference Range"**.
- **What to Observe**:
  1. The test `Serum Free Light Chains Ratio` has reference interval `"Not provided"`.
  2. The evaluation status is marked **Indeterminate** (Grey badge).
  3. The system explicitly refuses to invent a range or guess health status, stating: *"No laboratory reference interval was provided in the report. Clinical review is required."*
  4. The consultation preparation card highlights this test and suggests asking the physician for their target range.

---

### Scenario 5: Ambiguous OCR Value & Human-in-the-Loop Verification
- **Objective**: Demonstrate how low-confidence scan smudges are flagged for user confirmation.
- **Action**: Load **"Synthetic Report: Ambiguous OCR Artifact"**.
- **What to Observe**:
  1. Hemoglobin has an extraction confidence of 58% due to a scan smudge (`14.?2`).
  2. The table prominently displays an **"OCR Notice: Verify OCR"** badge.
  3. The detail card includes an interactive button: **"Confirm Document Value Matches Paper Report"**.
  4. The user can verify the value directly before discussing with a clinician.

---

### Scenario 6: Conservative Clinical Escalation (Severe Hyperkalemia)
- **Objective**: Demonstrate conservative escalation on life-threatening laboratory alerts.
- **Action**: Load **"Synthetic Report: Laboratory Critical Alert (Severe Hyperkalemia)"**.
- **What to Observe**:
  1. Potassium is measured at `6.8 mmol/L` with laboratory flag `CRITICAL HIGH`.
  2. The Safety & Triage Agent triggers both `LAB-SOURCE-CRIT-FLAG` and clinician-reviewed threshold rule `CRIT-K-01`.
  3. A high-priority **Critical Alert Banner** appears with clear emergency action guidance: *"Contact the reporting physician or seek immediate medical evaluation. If experiencing palpitations, chest discomfort, or severe weakness, seek emergency care immediately."*
  4. The threshold source is cited: `CAP Critical Limits Consensus Guidelines / MGH Laboratory Standards (v1.2)`.

---

### Scenario 7: Privacy, User Isolation & Deletion
- **Objective**: Verify authenticated user isolation and one-click data deletion.
- **Action**:
  1. Navigate to **"Privacy & Settings"**.
  2. Notice the authenticated UID and stored records list.
  3. Switch to a new user ID (e.g. `user_evaluator_2`) — observe that reports from the previous user are completely hidden.
  4. Switch back and click **"Delete All My Data"** — verify all records are permanently removed.
