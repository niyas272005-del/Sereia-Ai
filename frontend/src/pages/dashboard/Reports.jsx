import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share2, Printer, FileText, Eye, X, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';
import { useData } from '../../components/common/DataContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMood   = (v) => (v != null ? `${v}/10`  : 'N/A');
const fmtStress = (v) => (v != null ? `${v}/100` : 'N/A');
const fmtPct    = (v) => (v != null ? `${v}%`    : 'N/A');
const fmtChg    = (v) => {
  if (v == null) return '—';
  return v >= 0 ? `+${v}%` : `${v}%`;
};
const statusFromMood = (mood) => {
  if (mood == null) return 'No data';
  if (mood >= 8) return 'Excellent';
  if (mood >= 6) return 'Good';
  if (mood >= 4) return 'Fair';
  return 'Needs Attention';
};

// ─── Static report card definitions (no data, just metadata) ─────────────────
const REPORT_DEFS = [
  { id: 'weekly',     title: 'Weekly Summary Report',     icon: '📊', type: 'weekly',     description: 'An overview of your mood, stress, and wellness activities for the current week.' },
  { id: 'monthly',    title: 'Monthly Wellness Report',   icon: '📅', type: 'monthly',    description: 'A comprehensive view of your mental health trends throughout the month.' },
  { id: 'mood',       title: 'Mood Analysis Report',      icon: '🧠', type: 'mood',       description: 'Deep dive into your emotional patterns, triggers, and mood fluctuations.' },
  { id: 'assessment', title: 'Assessment Summary',        icon: '📋', type: 'assessment', description: 'Collated results from PHQ-9, GAD-7, and all clinical assessments taken.' },
  { id: 'journal',    title: 'Journal Summary Report',    icon: '📓', type: 'journal',    description: 'Key themes, emotion patterns, and insights extracted from your journal entries.' },
];

// ─── Build metric rows from live reportsData ──────────────────────────────────
function buildMetricRows(reportsData) {
  if (!reportsData || !reportsData.has_data) {
    return [
      { metric: 'Average Mood Score',    value: 'N/A', change: '—', status: 'No data' },
      { metric: 'Stress Level',          value: 'N/A', change: '—', status: 'No data' },
      { metric: 'Recovery Progress',     value: 'N/A', change: '—', status: 'No data' },
      { metric: 'Exercise Completion',   value: 'N/A', change: '—', status: 'No data' },
      { metric: 'Chat Sessions',         value: 'N/A', change: '—', status: 'No data' },
      { metric: 'Mood Logs',             value: 'N/A', change: '—', status: 'No data' },
    ];
  }
  // Use key_metrics from backend if available
  if (reportsData.key_metrics && reportsData.key_metrics.length > 0) {
    return reportsData.key_metrics.map(row => ({
      metric: row.metric,
      value:  row.value,
      change: '—',
      status: row.status,
    }));
  }
  // Fallback: build from flat fields
  return [
    { metric: 'Average Mood Score',  value: fmtMood(reportsData.avg_mood),            change: '—', status: statusFromMood(reportsData.avg_mood) },
    { metric: 'Stress Level',        value: fmtStress(reportsData.avg_stress),         change: '—', status: reportsData.avg_stress != null ? (reportsData.avg_stress < 40 ? 'Good' : reportsData.avg_stress < 70 ? 'Moderate' : 'High') : 'No data' },
    { metric: 'Recovery Progress',   value: fmtPct(reportsData.recovery_progress),     change: '—', status: (reportsData.recovery_progress ?? 0) >= 70 ? 'Good' : 'In Progress' },
    { metric: 'Exercise Completion', value: fmtPct(reportsData.exercise_completion),   change: '—', status: (reportsData.exercise_completion ?? 0) >= 50 ? 'Active' : 'Low' },
    { metric: 'Chat Sessions',       value: `${reportsData.chat_sessions ?? 0} sessions`, change: '—', status: (reportsData.chat_sessions ?? 0) > 0 ? 'Active' : 'No activity' },
    { metric: 'Mood Logs',           value: `${reportsData.total_logs ?? 0} entries`,  change: '—', status: (reportsData.total_logs ?? 0) > 0 ? 'Active' : 'No entries' },
  ];
}


// ─── Report Preview Modal ──────────────────────────────────────────────────────
const ReportPreviewModal = ({ report, reportsData, onClose }) => {
  if (!report) return null;

  const metricRows    = buildMetricRows(reportsData);
  const recommendations = reportsData?.recommendations ?? [
    'Start chatting with the AI to generate personalised recommendations based on your actual wellness data.',
  ];
  const hasData      = reportsData?.has_data ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in-up">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{report.icon}</span>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">{report.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated: {new Date().toLocaleString()} · {hasData ? 'Live data' : 'No data yet'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* PDF Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-8 space-y-6 font-mono text-sm">
            {/* Report Header */}
            <div className="border-b-2 border-indigo-600 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">S</div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Sereia Mental Wellness</p>
                  <p className="text-xs text-slate-500">Confidential Health Report</p>
                </div>
              </div>
              <h1 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-3">{report.title}</h1>
              <p className="text-xs text-slate-500">Generated: {new Date().toLocaleString()}</p>
              {hasData && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  ✓ Data sourced from {reportsData.total_logs} real AI conversation logs
                </p>
              )}
            </div>

            {/* Executive Summary */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider">Executive Summary</h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                {hasData
                  ? `This report provides a comprehensive analysis of mental wellness data from ${reportsData.period_start ?? 'the start'} to ${reportsData.period_end ?? 'today'}. Overall mood scores averaged ${fmtMood(reportsData.avg_mood)}. Stress levels are currently at ${fmtStress(reportsData.avg_stress)}. Recovery progress stands at ${fmtPct(reportsData.recovery_progress)}.`
                  : 'No conversation data available yet. Start chatting with the AI to generate a real wellness report based on your actual interactions.'}
              </p>
            </div>

            {/* Key Metrics Table — LIVE DATA */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Key Metrics</h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                    <th className="text-left p-2 text-indigo-700 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">Metric</th>
                    <th className="text-left p-2 text-indigo-700 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">Value</th>
                    <th className="text-left p-2 text-indigo-700 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">Change</th>
                    <th className="text-left p-2 text-indigo-700 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metricRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">{row.metric}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">{row.value}</td>
                      <td className={`p-2 border border-slate-200 dark:border-slate-700 font-medium ${
                        row.change.startsWith('+') ? 'text-green-600' : row.change.startsWith('-') ? 'text-red-600' : 'text-slate-400'
                      }`}>{row.change}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recommendations — generated from real dominant emotion */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider">Recommendations</h2>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-xs text-slate-400 text-center">
              <p>This report is generated by Sereia and is intended for informational purposes only.</p>
              <p>It is not a substitute for professional medical advice.</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <ReportActionButtons report={report} reportsData={reportsData} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

// ─── Report Action Buttons ─────────────────────────────────────────────────────
const ReportActionButtons = ({ report, reportsData, onClose }) => {
  const { addToast } = useToast();

  const handleDownload = () => {
    const metricRows = buildMetricRows(reportsData);
    const recommendations = reportsData?.recommendations ?? [];
    const lines = [
      `SEREIA MENTAL WELLNESS REPORT`,
      `${report.title}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Data source: ${reportsData?.has_data ? `${reportsData.total_logs} real AI conversation logs` : 'No data yet'}`,
      ``,
      `KEY METRICS`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...metricRows.map(r => `${r.metric}: ${r.value} (${r.change}) — ${r.status}`),
      ``,
      `RECOMMENDATIONS`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...recommendations.map((r, i) => `${i + 1}. ${r}`),
      ``,
      `This report is generated by Sereia. Not a substitute for professional medical advice.`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sereia-${report.id}-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Report downloaded successfully!', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: report.title, text: report.description });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    }
  };

  const handlePrint = () => {
    addToast('Opening print dialog...', 'success');
    window.print();
  };

  return (
    <>
      <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        Close
      </button>
      <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <Printer className="w-4 h-4" /> Print
      </button>
      <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
        <Share2 className="w-4 h-4" /> Share
      </button>
      <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20">
        <Download className="w-4 h-4" /> Download
      </button>
    </>
  );
};

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({ report, reportsData, onPreview }) => {
  const { addToast } = useToast();
  const hasData = reportsData?.has_data ?? false;

  const handleDownload = (e) => {
    e.stopPropagation();
    const metricRows = buildMetricRows(reportsData);
    const lines = [
      `SEREIA REPORT: ${report.title}`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      ...metricRows.map(r => `${r.metric}: ${r.value}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sereia-${report.id}-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Report downloaded!', 'success');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href).then(() => {
      addToast('Link copied to clipboard!', 'success');
    });
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    addToast('Opening print dialog...', 'success');
    window.print();
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="p-6 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-3xl flex-shrink-0 border border-indigo-100 dark:border-indigo-800/50">
            {report.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white leading-tight text-sm">{report.title}</h3>
              {hasData && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Live
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{report.description}</p>
          </div>
        </div>
      </div>

      {/* Data Summary Bar */}
      <div className="px-6 pb-3 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {hasData ? `${reportsData.total_logs} mood logs · ${reportsData.total_messages} messages` : 'No data yet — start chatting'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
        <button
          onClick={() => onPreview(report)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors col-span-1"
          title="Preview"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleDownload} className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Download">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleShare} className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Share">
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={handlePrint} className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Print">
          <Printer className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Reports Page ──────────────────────────────────────────────────────────────
const Reports = () => {
  const [previewReport, setPreviewReport] = useState(null);
  const { reportsData, isLoading } = useData();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportType = params.get('report');
    if (reportType === 'latest' || reportType === 'weekly') {
      setPreviewReport(REPORT_DEFS[0]);
    } else if (reportType) {
      const found = REPORT_DEFS.find(r => r.id === reportType);
      if (found) setPreviewReport(found);
    }
  }, [location.search]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Reports</h1>
          {isLoading && <Loader2 size={20} className="animate-spin text-indigo-500 mb-2" />}
          {reportsData?.has_data && !isLoading && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full mb-2">
              Live data · {reportsData.total_logs} logs
            </span>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400">Preview, download, share, and print your wellness reports.</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_DEFS.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            reportsData={reportsData}
            onPreview={setPreviewReport}
          />
        ))}
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          reportsData={reportsData}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  );
};

export default Reports;
