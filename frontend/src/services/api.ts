import { ReportSummaryItem, ReportAnalysis, DemoReportSummary, HistoricalComparisonItem } from '../types/report';

const API_BASE = '/api';

export function getAuthToken(): string {
  return localStorage.getItem('medilens_auth_token') || 'demo-token';
}

export function setAuthToken(token: string): void {
  localStorage.setItem('medilens_auth_token', token);
}

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getAuthToken()}`
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function fetchReports(): Promise<ReportSummaryItem[]> {
  const res = await fetch(`${API_BASE}/reports`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch reports.');
  }
  const data = await res.json();
  return data.reports || [];
}

export async function fetchReportAnalysis(reportId: string): Promise<ReportAnalysis> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/analysis`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch analysis.');
  }
  const data = await res.json();
  return data.analysis;
}

export async function uploadReport(
  file: File,
  consent: boolean,
  patientContext?: { age?: number; gender?: string; fasting?: boolean }
): Promise<{ reportId: string; analysis: ReportAnalysis; stagesCompleted: string[] }> {
  const formData = new FormData();
  formData.append('reportFile', file);
  formData.append('consent', String(consent));
  if (patientContext?.age) formData.append('age', String(patientContext.age));
  if (patientContext?.gender) formData.append('gender', patientContext.gender);
  if (patientContext?.fasting !== undefined) formData.append('fasting', String(patientContext.fasting));

  const res = await fetch(`${API_BASE}/reports/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed.');
  }

  return await res.json();
}

export async function fetchDemoReports(): Promise<DemoReportSummary[]> {
  const res = await fetch(`${API_BASE}/demo/reports`);
  if (!res.ok) throw new Error('Failed to fetch demo reports.');
  const data = await res.json();
  return data.demoReports || [];
}

export async function loadDemoReport(demoId: string): Promise<{ reportId: string; analysis: ReportAnalysis }> {
  const res = await fetch(`${API_BASE}/demo/load/${demoId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load demo report.');
  }
  return await res.json();
}

export async function compareReports(
  earlierReportId: string,
  newerReportId: string
): Promise<{
  earlierDate: string;
  newerDate: string;
  comparisons: HistoricalComparisonItem[];
}> {
  const res = await fetch(`${API_BASE}/reports/compare`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ earlierReportId, newerReportId })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Comparison failed.');
  }
  return await res.json();
}

export async function deleteReport(reportId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete report.');
  }
}

export function getExportUrl(reportId: string): string {
  return `${API_BASE}/reports/${reportId}/export`;
}

export async function fetchHealth(): Promise<any> {
  const res = await fetch('/health');
  return await res.json();
}
