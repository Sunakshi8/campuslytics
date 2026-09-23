import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Compass,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Layers,
  Award,
  ChevronRight,
  Calendar,
  Code,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import AiJobMatchModal from '../../components/ai/AiJobMatchModal';
import { aiApi } from '../../api/endpoints';

export default function AiSkillGapDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'roadmap' | 'drives'
  const [driveFilter, setDriveFilter] = useState('All');

  // Modal for individual drive match
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDriveData, setSelectedDriveData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gapRes, roadmapRes] = await Promise.all([
        aiApi.getStudentSkillGap(),
        aiApi.getStudentRoadmap(),
      ]);
      setData(gapRes.data);
      setRoadmap(roadmapRes.data.roadmap);
    } catch (err) {
      console.error('Error fetching skill gap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    try {
      const res = await aiApi.regenerateRoadmap();
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('Error regenerating roadmap:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleTask = async (weekNumber, taskId) => {
    try {
      const res = await aiApi.toggleRoadmapTask(weekNumber, taskId);
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleOpenDriveReport = async (driveId) => {
    setModalLoading(true);
    try {
      const res = await aiApi.getStudentDriveMatchReport(driveId);
      setSelectedDriveData(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching drive match report:', err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="Smart Skill Gap Dashboard">
        <Spinner />
      </DashboardLayout>
    );
  }

  const metrics = data?.metrics || {
    eligibleDrivesCount: 8,
    nearMatchDrivesCount: 5,
    missedOpportunitiesCount: 12,
    overallGapScore: -85,
    averageGap: -14.3,
    criticalGapsCount: 1,
    strengthsCount: 2,
  };

  const answers = data?.answers || {
    whyIneligible: [],
    howToBecomeEligible: [],
    whatToLearnNext: [],
  };

  const topMissingSkills = data?.topMissingSkills || [];
  const radarScores = data?.radarScores || [];
  const driveBreakdown = data?.driveBreakdown || [];

  const filteredDrives = driveBreakdown.filter((d) => {
    if (driveFilter === 'All') return true;
    return d.status.toLowerCase() === driveFilter.toLowerCase();
  });

  return (
    <DashboardLayout
      role="student"
      title="Skills Gap Analysis"
      subtitle="Compare your current skill levels with job requirements across campus placement drives."
    >
      {/* Top Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers size={15} /> Skill Gap Dashboard
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'roadmap'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOpen size={15} /> AI Learning Roadmap
        </button>
        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'drives'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Briefcase size={15} /> Drive-by-Drive Gaps
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards (Directly matching reference image amart skill gap dashboard.jpg) */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Total Gap */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-rose-600">{metrics.overallGapScore}</p>
              <p className="mt-1 text-xs font-bold text-ink-800">Total Gap</p>
              <p className="text-[11px] text-gray-500">Points below target</p>
            </div>

            {/* Average Gap */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-amber-600">{metrics.averageGap}</p>
              <p className="mt-1 text-xs font-bold text-ink-800">Average Gap</p>
              <p className="text-[11px] text-gray-500">Per skill area</p>
            </div>

            {/* Critical Gaps */}
            <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-red-600">{metrics.criticalGapsCount}</p>
              <p className="mt-1 text-xs font-bold text-ink-800">Critical Gaps</p>
              <p className="text-[11px] text-rose-500 font-medium">Need immediate attention</p>
            </div>

            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-emerald-600">{metrics.strengthsCount}</p>
              <p className="mt-1 text-xs font-bold text-ink-800">Strengths</p>
              <p className="text-[11px] text-emerald-600 font-medium">Meeting expectations</p>
            </div>
          </div>

          {/* 3 Core Questions Section: "Why am I not eligible?", "How do I become eligible?", "What should I learn next?" */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Question 1 */}
            <div className="card border-l-4 border-l-rose-500 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={18} className="text-rose-500" />
                <h4 className="font-bold text-ink-900 text-sm">Why am I not eligible?</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {answers.whyIneligible.length > 0 ? (
                  answers.whyIneligible.map((ans, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{ans}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No active eligibility blockers identified.</p>
                )}
              </ul>
            </div>

            {/* Question 2 */}
            <div className="card border-l-4 border-l-blue-500 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Compass size={18} className="text-blue-500" />
                <h4 className="font-bold text-ink-900 text-sm">How do I become eligible?</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {answers.howToBecomeEligible.length > 0 ? (
                  answers.howToBecomeEligible.map((ans, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{ans}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Maintain current high performance.</p>
                )}
              </ul>
            </div>

            {/* Question 3 */}
            <div className="card border-l-4 border-l-emerald-500 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-emerald-500" />
                <h4 className="font-bold text-ink-900 text-sm">What should I learn next?</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {answers.whatToLearnNext.length > 0 ? (
                  answers.whatToLearnNext.map((ans, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{ans}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Explore cutting-edge frameworks.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Drive Opportunity Summary Row (Eligible: 8, Near-match: 5, Missed: 12) */}
          <div className="rounded-2xl bg-gradient-to-r from-ink-900 to-ink-800 p-6 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-brand-300">
                  Student Placement AI
                </span>
                <h3 className="mt-2 text-xl font-bold">Personalized recommendations based on placement drives</h3>
                <p className="text-xs text-gray-300">Real-time matching against active campus drives</p>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-emerald-400">{metrics.eligibleDrivesCount}</p>
                  <p className="text-xs font-medium text-gray-300">Eligible drives</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-amber-400">{metrics.nearMatchDrivesCount}</p>
                  <p className="text-xs font-medium text-gray-300">Near-match drives</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-rose-400">{metrics.missedOpportunitiesCount}</p>
                  <p className="text-xs font-medium text-gray-300">Missed opportunities</p>
                </div>
              </div>
            </div>
          </div>

          {/* High-Demand Missing Skills Ranking + Radar Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* High-Demand Missing Skills List (Matches prompt: Node.js missing in 9, Docker in 6, etc.) */}
            <div className="card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-ink-900 text-sm">High-Demand Missing Skills</h3>
                  <p className="text-xs text-gray-500">Skills most frequently demanded by campus recruiters</p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600">
                  Priority Ranking
                </span>
              </div>

              <div className="space-y-3">
                {topMissingSkills.length > 0 ? (
                  topMissingSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-3 hover:bg-gray-100/70 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                            sk.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-ink-900 text-sm">{sk.skill}</p>
                          <p className="text-xs text-gray-500">
                            Missing in <span className="font-semibold text-rose-600">{sk.missingInDrivesCount} drives</span>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          sk.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {sk.priority} Priority
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-4 text-center">No missing skills detected!</p>
                )}
              </div>
            </div>

            {/* Skills Radar Chart (Matches reference image amart skill gap dashboard.jpg) */}
            <div className="card p-6 shadow-sm flex flex-col items-center">
              <h3 className="font-bold text-ink-900 text-sm mb-2 text-left w-full">Skills Radar Chart</h3>
              <p className="text-xs text-gray-500 mb-4 text-left w-full">Current Level vs Expected Level across core competencies</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarScores}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Current Level"
                      dataKey="currentLevel"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.25}
                    />
                    <Radar
                      name="Expected Level"
                      dataKey="expectedLevel"
                      stroke="#6366f1"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Skill Breakdown Grid (Matching bottom cards of amart skill gap dashboard.jpg) */}
          <div>
            <h3 className="font-bold text-ink-900 text-base mb-3">Skill Competency Breakdown</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {radarScores.map((scoreItem, idx) => (
                <div key={idx} className="card p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-ink-800 text-sm">{scoreItem.subject}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        scoreItem.status === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : scoreItem.status === 'below'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {scoreItem.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Current: <strong className="text-ink-900">{scoreItem.currentLevel}%</strong></span>
                    <span>Target: <strong className="text-ink-900">{scoreItem.expectedLevel}%</strong></span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 mb-2">
                    <div
                      className={`h-full rounded-full ${
                        scoreItem.status === 'critical'
                          ? 'bg-rose-500'
                          : scoreItem.status === 'below'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${scoreItem.currentLevel}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-gray-400">Gap</span>
                    <span
                      className={
                        scoreItem.gap < 0
                          ? scoreItem.gap <= -20
                            ? 'text-rose-600'
                            : 'text-amber-600'
                          : 'text-emerald-600'
                      }
                    >
                      {scoreItem.gap > 0 ? `+${scoreItem.gap}%` : `${scoreItem.gap}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Personalized Learning Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-6 text-white shadow-md">
            <div>
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold">
                Personalized Learning Pathway
              </span>
              <h3 className="mt-2 text-xl font-bold">4-Week AI Placement Sprint</h3>
              <p className="text-xs text-brand-100">
                Targeted weekly tasks designed to close your critical skill gaps and unlock missed drive opportunities.
              </p>
            </div>
            <button
              onClick={handleRegenerateRoadmap}
              disabled={regenerating}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand-700 shadow transition hover:bg-brand-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Regenerating...' : 'Regenerate with AI'}
            </button>
          </div>

          {/* Weekly Roadmap Items */}
          <div className="space-y-4">
            {roadmap?.weeks?.map((w) => (
              <div key={w.week} className="card p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 border border-brand-200">
                      Week {w.week}
                    </span>
                    <h4 className="mt-1 text-base font-bold text-ink-900">{w.title}</h4>
                    <p className="text-xs text-gray-500">{w.focus}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {w.skillsTargeted?.map((sk, idx) => (
                      <span key={idx} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tasks Checklist */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Action Items</p>
                  {w.tasks?.map((t) => (
                    <label
                      key={t._id}
                      className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => handleToggleTask(w.week, t._id)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className={`text-xs ${t.completed ? 'line-through text-gray-400' : 'text-ink-800 font-medium'}`}>
                        {t.task}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Milestone Project */}
                {w.milestoneProject && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800">
                    <Award size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>Milestone Project:</strong> {w.milestoneProject}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drive-by-Drive Gaps Tab */}
      {activeTab === 'drives' && (
        <div className="card overflow-hidden shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-ink-900 text-base">Campus Placement Drives</h3>
                <p className="text-xs text-gray-500">
                  Inspect your exact eligibility status, skill match %, and missing criteria for every active drive.
                </p>
              </div>

              <div className="flex gap-2">
                {['All', 'Eligible', 'Near Match', 'Missed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDriveFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      driveFilter === f ? 'bg-ink-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Match %</th>
                  <th className="px-5 py-3.5">Missing Requirements</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDrives.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink-900">{d.title}</p>
                      <p className="text-xs text-gray-500">{d.company} • {d.location}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          d.status === 'Eligible'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Near Match'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.matchPct >= 80
                                ? 'bg-emerald-500'
                                : d.matchPct >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${d.matchPct}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-ink-900">{d.matchPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {d.missingSkills.length > 0 ? (
                          d.missingSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100"
                            >
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">None (Fully matched)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenDriveReport(d._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-sm"
                      >
                        <Sparkles size={13} /> View AI Gap Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Job Match Report Modal */}
      {selectedDriveData && (
        <AiJobMatchModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={selectedDriveData}
        />
      )}
    </DashboardLayout>
  );
}
