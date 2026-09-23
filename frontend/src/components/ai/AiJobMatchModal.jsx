import React from 'react';
import { X, Sparkles, Download, CheckCircle2, AlertCircle, FileText, Briefcase, GraduationCap } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AiJobMatchModal({ isOpen, onClose, data, onStatusChange, currentStatus }) {
  if (!isOpen || !data) return null;

  const { drive, student, analysis } = data;
  const matchScore = analysis?.matchScore || 0;
  const atsScore = analysis?.atsScore || 70;
  const keywordCoverage = analysis?.keywordCoverage || 65;
  const breakdown = analysis?.breakdown || {
    skillMatch: 75,
    experienceFit: 70,
    requirementFit: 60,
  };

  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const strengths = analysis?.strengths || [];
  const candidateSummary = analysis?.candidateSummary || '';

  // Bar chart data for breakdown (matches breakdown in reference image)
  const breakdownBarData = [
    { name: 'Skill', score: breakdown.skillMatch || matchScore },
    { name: 'Experience', score: breakdown.experienceFit || 70 },
    { name: 'Keywords', score: keywordCoverage },
    { name: 'Requirements', score: breakdown.requirementFit || 65 },
    { name: 'ATS', score: atsScore },
  ];

  // Radar chart data (matches radar in reference image)
  const radarData = [
    { subject: 'Skill Match', value: breakdown.skillMatch || matchScore, fullMark: 100 },
    { subject: 'Experience', value: breakdown.experienceFit || 75, fullMark: 100 },
    { subject: 'Keywords', value: keywordCoverage, fullMark: 100 },
    { subject: 'Requirements', value: breakdown.requirementFit || 70, fullMark: 100 },
    { subject: 'Overall', value: matchScore, fullMark: 100 },
  ];

  // Combine skills for heatmap list
  const heatmapSkills = [
    ...matchedSkills.map((s) => ({ name: s, matched: true, score: 90 })),
    ...missingSkills.map((s) => ({ name: s, matched: false, score: 25 })),
  ];

  const handlePrint = () => {
    window.print();
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-5xl rounded-2xl bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-ink-900">AI Job Match Report</h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Grade: {getGrade(matchScore)}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                  Difficulty: {drive?.jobType === 'Internship' ? 'Moderate' : 'Hard'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Target Role: <span className="font-semibold text-ink-800">{drive?.title}</span> • Candidate: <span className="font-semibold text-brand-600">{student?.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              title="Download or Print PDF"
            >
              <Download size={14} /> Download PDF Report
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[82vh] overflow-y-auto p-6 space-y-6">
          {/* Executive Summary & AI Recommendation */}
          <div className="rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50/50 via-white to-blue-50/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles size={12} /> AI Recommendation: {analysis?.aiRecommendation || 'Good Match'}
                </span>
                <p className="mt-2 text-sm text-ink-800 leading-relaxed font-medium">
                  {candidateSummary || 'Candidate demonstrates relevant competencies aligned with role specifications.'}
                </p>
              </div>
              {onStatusChange && (
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Recruiter Decision:</span>
                  <select
                    value={currentStatus || 'Applied'}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-ink-800 shadow-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Big Match Score Box */}
            <div className="flex items-center justify-between rounded-xl bg-blue-600 p-5 text-white shadow-md">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-100">Match Score</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">{matchScore}</span>
                  <span className="text-xl font-bold text-blue-200">%</span>
                </div>
                <p className="mt-1 text-xs text-blue-100">Overall compatibility</p>
              </div>
              <div className="h-14 w-14 rounded-full border-4 border-blue-400/40 flex items-center justify-center bg-blue-500/30">
                <Sparkles size={28} className="text-white" />
              </div>
            </div>

            {/* ATS Score Box */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ATS Score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink-900">{atsScore}%</span>
                <span className="text-xs text-emerald-600 font-semibold">High parsability</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${atsScore}%` }} />
              </div>
            </div>

            {/* Keyword Coverage Box */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Keyword Coverage</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink-900">{keywordCoverage}%</span>
                <span className="text-xs text-brand-600 font-semibold">JD matching terms</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${keywordCoverage}%` }} />
              </div>
            </div>
          </div>

          {/* Breakdown & Dimension Analysis (Chart Row) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Dimension Bar Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-ink-900 text-sm">Breakdown by Metric</h3>
                <div className="flex gap-4 text-xs font-semibold text-gray-500">
                  <span>Skill: {breakdown.skillMatch}%</span>
                  <span>Exp: {breakdown.experienceFit}%</span>
                  <span>Req Fit: {breakdown.requirementFit}%</span>
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Score']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Radar Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 font-bold text-ink-900 text-sm">Skill & Requirement Radar</h3>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="CV Match" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Keywords & Missing Skills Pills */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Keywords */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-ink-900 text-sm mb-3">Top Keywords Matched</h3>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((k, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200"
                    >
                      <CheckCircle2 size={13} className="text-blue-500" />
                      {k}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No explicit matching keywords tagged.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-ink-900 text-sm">Missing Skills</h3>
                <span className="text-[11px] text-rose-500 font-medium">Missing skills highlighted in red</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map((k, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200"
                    >
                      <AlertCircle size={13} className="text-rose-500" />
                      {k}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Full skill alignment! No critical missing skills found.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Skill Heatmap Progress List */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-ink-900 text-sm mb-4">Skill Heatmap Comparison</h3>
            <div className="space-y-3">
              {heatmapSkills.map((sk, idx) => (
                <div key={idx} className="flex items-center gap-4 text-xs">
                  <span className="w-28 font-medium text-ink-800 truncate" title={sk.name}>
                    {sk.name}
                  </span>
                  <div className="flex-1 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sk.matched ? 'bg-blue-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${sk.matched ? '100%' : '20%'}` }}
                    />
                  </div>
                  <span
                    className={`w-16 text-right font-semibold ${
                      sk.matched ? 'text-blue-600' : 'text-rose-600'
                    }`}
                  >
                    {sk.matched ? 'Matched' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Strengths */}
          {strengths.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
              <h3 className="font-bold text-ink-900 text-sm mb-3">Key Candidate Strengths</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50 rounded-b-2xl">
          <p className="text-xs text-gray-500">
            AI Placement Intelligence Screen • Assisted by Google Gemini
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-ink-900 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-ink-800 transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
