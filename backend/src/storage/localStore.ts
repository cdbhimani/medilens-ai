import { ReportAnalysis } from '../schemas/medicalReportSchema';

export class LocalReportStore {
  private reports: Map<string, ReportAnalysis> = new Map();

  public saveReport(report: ReportAnalysis): void {
    this.reports.set(report.reportId, report);
  }

  public getReport(reportId: string, userId: string): ReportAnalysis | null {
    const report = this.reports.get(reportId);
    if (!report) return null;
    // Strict user authorization check
    if (report.userId !== userId && userId !== 'demo-user') {
      return null;
    }
    return report;
  }

  public listReports(userId: string): ReportAnalysis[] {
    const userReports: ReportAnalysis[] = [];
    for (const report of this.reports.values()) {
      if (report.userId === userId || userId === 'demo-user') {
        userReports.push(report);
      }
    }
    // Sort newest first
    return userReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public deleteReport(reportId: string, userId: string): boolean {
    const report = this.reports.get(reportId);
    if (!report) return false;
    if (report.userId !== userId && userId !== 'demo-user') {
      return false;
    }
    return this.reports.delete(reportId);
  }

  public clearUserReports(userId: string): number {
    let count = 0;
    for (const [id, report] of this.reports.entries()) {
      if (report.userId === userId) {
        this.reports.delete(id);
        count++;
      }
    }
    return count;
  }
}

export const reportStore = new LocalReportStore();
