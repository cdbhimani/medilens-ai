import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchReports, deleteReport } from '../services/api';
import { ReportSummaryItem } from '../types/report';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Shield,
  Trash2,
  Lock,
  UserCheck,
  Server,
  AlertCircle,
  FileText,
  RefreshCw,
  LogOut
} from 'lucide-react';

export const PrivacySettingsPage: React.FC = () => {
  const { user, loginAsDemo, logout } = useAuth();
  const [reports, setReports] = useState<ReportSummaryItem[]>([]);
  const [customUid, setCustomUid] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUserReports = async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserReports();
  }, [user]);

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all stored reports and extracted data for this user ID?')) {
      return;
    }

    for (const r of reports) {
      await deleteReport(r.reportId);
    }
    await loadUserReports();
    alert('All records for this user have been permanently deleted.');
  };

  const handleSwitchUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUid.trim()) {
      loginAsDemo(customUid.trim());
      setCustomUid('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-600" />
          Privacy, Security & User Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your session, inspect stored report records, and review security isolation policies.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* User Session & Identity Isolation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-600" />
          Current User Identity & Authorization
        </h3>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Authenticated UID:</span>
            <span className="font-mono font-bold text-slate-900">{user?.uid || 'Not authenticated'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Session Mode:</span>
            <span className="font-semibold text-teal-800">
              {user?.isDemo ? 'Evaluation Demo Session (User-Isolated)' : 'Firebase Authenticated'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Stored Reports Count:</span>
            <span className="font-bold text-slate-900">{reports.length} report(s)</span>
          </div>
        </div>

        {/* Switch User to test cross-user isolation */}
        <form onSubmit={handleSwitchUser} className="border-t border-slate-100 pt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Test Multi-User Isolation (Switch User Identity)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter new user ID (e.g. user_bob, user_alice)"
              value={customUid}
              onChange={e => setCustomUid(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-lg flex-1 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition"
            >
              Switch User
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Switching user IDs tests that report records from user A are strictly invisible to user B on the backend.
          </p>
        </form>
      </div>

      {/* Stored Reports Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Your Stored Report Records ({reports.length})
          </h3>

          {reports.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-lg transition border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All My Data
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No reports currently stored for this user.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {reports.map(r => (
              <div key={r.reportId} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900">{r.labName || r.fileName}</span>
                  <span className="text-slate-400 ml-2 font-mono">({r.reportId})</span>
                  <span className="text-slate-500 block text-[11px]">
                    {r.testCount} tests • Analyzed on {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await deleteReport(r.reportId);
                    await loadUserReports();
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Architecture & Compliance Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          Data Handling, Retention & Cloud Security Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Least-Privilege Authorization</span>
            <p className="leading-relaxed text-slate-600">
              Every API endpoint verifies the authenticated user ID on the server side. Firestore Security Rules and private Cloud Storage bucket rules reject access if the requesting UID does not match the document owner.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Google Gemini API Data Privacy</span>
            <p className="leading-relaxed text-slate-600">
              Only document text and multimodal image bytes are sent to the enterprise Google GenAI API endpoint. No customer report contents are logged to server console or public log streams.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Permanent Deletion Guarantee</span>
            <p className="leading-relaxed text-slate-600">
              Clicking "Delete" triggers cascade removal of the metadata record, extracted biomarker tables, and associated storage files.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Regulatory Compliance Notice</span>
            <p className="leading-relaxed text-slate-600">
              MediLens AI is an educational demonstration assistant. It is not claimed to be a certified medical device or HIPAA certified for production clinical practice without prior independent clinical and compliance audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
