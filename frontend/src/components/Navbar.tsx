import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, UploadCloud, History, Shield, LayoutDashboard, UserCheck, Stethoscope, Zap, Loader2, Video } from 'lucide-react';
import { loadDemoReport } from '../services/api';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate?: (tab: string, reportId?: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onNavigate }) => {
  const { user } = useAuth();
  const [loadingSample, setLoadingSample] = useState(false);

  const handleQuickSample = async () => {
    try {
      setLoadingSample(true);
      const res = await loadDemoReport('demo-cbc-standard');
      if (onNavigate) {
        onNavigate('detail', res.reportId);
      } else {
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      alert('Failed to load sample report: ' + err.message);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">MediLens</span>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600 text-lg">AI</span>
              </div>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold block -mt-1">
                Medical Report Understanding
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'upload'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload Report
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'compare'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              Compare Trends
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'privacy'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy & Settings
            </button>
          </nav>

          {/* Right Header Status / Demo Pill */}
          <div className="flex items-center gap-2.5">
            <a
              href="/demo_video.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition"
              title="Watch 3.5-minute project demonstration video"
            >
              <Video className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Video</span>
            </a>

            <button
              onClick={handleQuickSample}
              disabled={loadingSample}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              title="Test immediately with a pre-loaded sample Complete Blood Count (CBC) report"
            >
              {loadingSample ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Testing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Sample Report</span>
                </>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>User:</span>
              <span className="font-mono text-[11px] truncate max-w-[100px]">{user?.uid || 'evaluator'}</span>
            </div>

            <button
              onClick={() => setActiveTab('upload')}
              className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Analyze Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
