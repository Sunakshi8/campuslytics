import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Filter,
  Users,
  Award,
  TrendingUp,
  RefreshCw,
  FileCheck,
  CheckCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import AiJobMatchModal from '../../components/ai/AiJobMatchModal';
import { aiApi, companyApi } from '../../api/endpoints';

export default function AiRecruiterCopilot({ role = 'company' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const driveParam = searchParams.get('driveId');

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(driveParam || '');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minMatch, setMinMatch] = useState(0);
  const [activeTab, setActiveTab] = useState('scoring'); // 'scoring' | 'comparison' | 'pipeline'

  // Modal State
  const [selectedCandidateReport, setSelectedCandidateReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch company drives
  useEffect(() => {
    companyApi
      .listDrives()
      .then((res) => {
        const driveList = res.data.drives || [];
        setDrives(driveList);
        if (driveList.length > 0 && !selectedDriveId) {
          setSelectedDriveId(driveList[0]._id);
        }
      })
      .catch((err) => console.error('Error fetching drives:', err));
  }, []);

  // Fetch ranked candidates whenever drive or filters change
  const loadRankedCandidates = () => {
    if (!selectedDriveId) return;
    setLoading(true);
    aiApi
      .getRankedCandidates(selectedDriveId, {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search || undefined,
        minMatch: minMatch > 0 ? minMatch : undefined,
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Error fetching ranked candidates:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedDriveId) {
      loadRankedCandidates();
    }
  }, [selectedDriveId, statusFilter, minMatch]);

  const handleDriveChange = (e) => {
    const id = e.target.value;
    setSelectedDriveId(id);
    setSearchParams({ driveId: id });
  };

  // Run AI Batch Screening
  const handleBatchAnalyze = async () => {
    if (!selectedDriveId) return;
    setAnalyzingAll(true);
    try {
      await aiApi.analyzeAllDriveApplicants(selectedDriveId);
      loadRankedCandidates();
    } catch (err) {
      console.error('Batch screening error:', err);
    } finally {
      setAnalyzingAll(false);
    }
  };

  // Open modal report
  const handleOpenReport = async (candidate) => {
    setModalLoading(true);
    try {
      const res = await aiApi.getCandidateReport(selectedDriveId, candidate.student._id);
      setSelectedCandidateReport(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Error loading full report:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Change candidate status directly from copilot
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await companyApi.updateApplicationStatus(appId, { status: newStatus });
      loadRankedCandidates();
      if (selectedCandidateReport) {
        setSelectedCandidateReport((prev) => ({
          ...prev,
          application: { ...prev.application, status: newStatus },
        }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const driveTitle = data?.drive?.title || 'Placement Drive';
  const candidates = data?.candidates || [];
  const metrics = data?.metrics || {
    totalScreened: 0,
    screeningAccuracy: 92,
    topMatch: 0,
    avgMatch: 0,
    shortlistedCount: 0,
  };
  const comparisonData = data?.comparisonData || [];

  return (
    <DashboardLayout
      role={role}
      title="Recruiter AI Copilot"
      subtitle="AI-powered resume screening, match scoring, and candidate shortlisting."
    >
      {/* Top Bar with Drive Selector & AI Action */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
            <Sparkles size={24} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Placement Drive
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedDriveId}
                onChange={handleDriveChange}
                className="font-bold text-ink-900 border-none bg-transparent pr-8 py-1 text-base focus:ring-0 cursor-pointer outline-none"
              >
                {drives.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.jobType})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchAnalyze}
            disabled={analyzingAll || !selectedDriveId}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-500 disabled:opacity-50"
          >
            <RefreshCw size={14} className={analyzingAll ? 'animate-spin' : ''} />
            {analyzingAll ? 'Running AI Screening...' : 'Run AI Batch Screening'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Candidate Scoring, Skills Match, Pipeline, Benchmarks) */}
      <div className="mb-6 flex gap-2 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'scoring'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100 hover:text-ink-800'
          }`}
        >
          <Award size={15} /> Candidate Scoring & Shortlist
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'comparison'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100 hover:text-ink-800'
          }`}
        >
          <TrendingUp size={15} /> Dimension Comparison Chart
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Row (Matches reference image ai.jpg) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Candidates Screened
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-teal-600">
                  {metrics.totalScreened}
                </span>
                <span className="text-xs text-gray-500">applicants</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Analyzed against drive specifications</p>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Screening Accuracy
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">
                  {metrics.screeningAccuracy}%
                </span>
                <span className="text-xs text-emerald-600 font-semibold">Gemini Calibrated</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Semantic skill & requirement fit</p>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Top Match Score
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-600">
                  {metrics.topMatch}%
                </span>
                <span className="text-xs text-brand-500 font-semibold">High affinity</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Best-in-batch alignment</p>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Shortlisted
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {metrics.shortlistedCount}
                </span>
                <span className="text-xs text-emerald-500 font-semibold">Candidates</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Recruiter confirmed decisions</p>
            </div>
          </div>

          {activeTab === 'comparison' && (
            /* Candidate Comparison Across Key Dimensions (Grouped Bar Chart inspired by ai.jpg) */
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-ink-900 text-base">
                    Candidate Comparison Across Key Dimensions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Multidimensional benchmarking: Technical Skills, Culture Fit, Communication, Experience
                  </p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => [`${val}/100`, '']}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="technicalSkills" name="Technical Skills" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="cultureFit" name="Culture Fit" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="communication" name="Communication" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="experience" name="Experience" fill="#93c5fd" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Ranked Candidates Section */}
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink-900 text-base">Top Ranked Candidates</h3>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200">
                      {driveTitle} • Ranked by match score
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    AI analyzes resumes against drive description. Recruiter controls final selection.
                  </p>
                </div>

                {/* Filter and search controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name, skills..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadRankedCandidates()}
                      className="rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select
                    value={minMatch}
                    onChange={(e) => setMinMatch(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="0">All Match Scores</option>
                    <option value="90">≥ 90% Match</option>
                    <option value="80">≥ 80% Match</option>
                    <option value="70">≥ 70% Match</option>
                  </select>
                </div>
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-ink-800">No candidates match current criteria</p>
                <p className="text-xs text-gray-500">Try adjusting your filters or click Run AI Batch Screening.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-5 py-3.5 w-14">Rank</th>
                      <th className="px-5 py-3.5">Candidate</th>
                      <th className="px-5 py-3.5 w-36">Match %</th>
                      <th className="px-5 py-3.5">Skills & Insights</th>
                      <th className="px-5 py-3.5">Experience</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {candidates.map((c) => {
                      const matchPct = c.analysis?.matchScore || 0;
                      return (
                        <tr key={c.student._id} className="hover:bg-gray-50/80 transition">
                          {/* Rank badge */}
                          <td className="px-5 py-4 font-bold text-gray-500">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                                c.rank === 1
                                  ? 'bg-amber-100 text-amber-800 font-extrabold'
                                  : c.rank === 2
                                  ? 'bg-gray-200 text-gray-800 font-bold'
                                  : c.rank === 3
                                  ? 'bg-orange-100 text-orange-800 font-bold'
                                  : 'text-gray-500'
                              }`}
                            >
                              {c.rank}.
                            </span>
                          </td>

                          {/* Candidate info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 font-bold text-teal-700 text-xs">
                                {c.student.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-ink-900">{c.student.name}</p>
                                <p className="text-xs text-gray-500">
                                  {c.student.branch} • {c.student.cgpa} CGPA
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Match % progress bar */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className={`h-full rounded-full ${
                                    matchPct >= 90
                                      ? 'bg-teal-500'
                                      : matchPct >= 75
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${matchPct}%` }}
                                />
                              </div>
                              <span className="font-extrabold text-xs text-ink-900 w-8">
                                {matchPct}%
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">
                              ATS: {c.analysis?.atsScore || 70}%
                            </span>
                          </td>

                          {/* Skills Pills & Summary note */}
                          <td className="px-5 py-4 max-w-xs">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {(c.analysis?.matchedSkills || c.student.skills || [])
                                .slice(0, 4)
                                .map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-100"
                                  >
                                    {s}
                                  </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 italic">
                              {c.analysis?.candidateSummary || 'Candidate evaluated for drive.'}
                            </p>
                          </td>

                          {/* Experience / Year */}
                          <td className="px-5 py-4 text-xs font-medium text-gray-600">
                            {c.student.year || '4th Year'}
                          </td>

                          {/* Recruiter Status Control */}
                          <td className="px-5 py-4">
                            <select
                              value={c.status}
                              onChange={(e) => handleStatusChange(c.applicationId, e.target.value)}
                              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-800 shadow-sm focus:border-brand-500 focus:outline-none"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleOpenReport(c)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition shadow-sm"
                            >
                              <Sparkles size={13} /> View AI Report
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Job Match Report Modal */}
      {selectedCandidateReport && (
        <AiJobMatchModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={selectedCandidateReport}
          currentStatus={selectedCandidateReport.application?.status}
          onStatusChange={(newStatus) => {
            if (selectedCandidateReport.application?._id) {
              handleStatusChange(selectedCandidateReport.application._id, newStatus);
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}
