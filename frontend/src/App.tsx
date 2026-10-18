import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const handleNavigate = (tab: string, reportId?: string) => {
    if (reportId) {
      setActiveReportId(reportId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={handleNavigate} />

        <main className="transition-all">
          {activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {activeTab === 'upload' && <UploadPage onNavigate={handleNavigate} />}
          {activeTab === 'detail' && activeReportId && (
            <AnalysisDetailPage reportId={activeReportId} onNavigate={handleNavigate} />
          )}
          {activeTab === 'compare' && <ComparisonPage />}
          {activeTab === 'privacy' && <PrivacySettingsPage />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
