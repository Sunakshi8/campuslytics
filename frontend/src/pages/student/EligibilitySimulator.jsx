import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { studentApi } from '../../api/endpoints';
import { TrendingUp, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function EligibilitySimulator() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    studentApi.simulator().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="student" title="Placement Eligibility Simulator">
        <Spinner />
      </DashboardLayout>
    );
  }

  const { profile, eligibleCompanies, totalCompanies, simulation } = data;
  const pct = totalCompanies ? Math.round((eligibleCompanies / totalCompanies) * 100) : 0;

  return (
    <DashboardLayout
      role="student"
      title="Placement Eligibility Simulator"
      subtitle="Find out how you can improve your chances and explore more opportunities."
    >
      {/* AI Skill Gap & Roadmap Promotion Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-ink-900 p-5 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Want deeper insights with Gemini AI?</h4>
            <p className="text-xs text-white/80">Explore the new Smart Skill Gap Dashboard & 4-Week AI Placement Learning Roadmap.</p>
          </div>
        </div>
        <Link
          to="/student/ai-skill-gap"
          className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-ink-900 shadow hover:bg-gray-100 transition"
        >
          Open AI Skill Gap Dashboard <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="mb-4 font-bold text-ink-900">Your Current Profile</h3>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full">
              <svg className="absolute h-20 w-20 -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#f5e6dc" strokeWidth="8" fill="none" />
                <circle
                  cx="40" cy="40" r="34" stroke="#e85d25" strokeWidth="8" fill="none"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - pct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-lg font-bold text-brand-600">{pct}%</span>
            </div>
            <div>
              <p className="text-xl font-bold text-ink-900">{eligibleCompanies} companies</p>
              <p className="text-sm text-gray-500">out of {totalCompanies} currently open</p>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="CGPA" value={profile.cgpa} />
            <Row label="Branch" value={profile.branch || 'Not set'} />
            <Row label="Year" value={profile.year || 'Not set'} />
            <Row label="Backlogs" value={profile.backlogs} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.skills?.map((s) => (
              <span key={s} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{s}</span>
            ))}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 font-bold text-ink-900">What if you improve?</h3>
          <div className="space-y-3">
            <ScenarioRow
              label={`If CGPA becomes ${simulation.scenarios.ifCgpaImproves.targetCgpa}`}
              gain={simulation.scenarios.ifCgpaImproves.gain}
              newCount={simulation.scenarios.ifCgpaImproves.newEligibleCount}
            />
            <ScenarioRow
              label={
                simulation.scenarios.ifSkillsAdded.addedSkills.length
                  ? `If you add ${simulation.scenarios.ifSkillsAdded.addedSkills.slice(0, 3).join(', ')}`
                  : 'If you add missing required skills'
              }
              gain={simulation.scenarios.ifSkillsAdded.gain}
              newCount={simulation.scenarios.ifSkillsAdded.newEligibleCount}
            />
            <ScenarioRow
              label="If you clear all backlogs"
              gain={simulation.scenarios.ifBacklogsCleared.gain}
              newCount={simulation.scenarios.ifBacklogsCleared.newEligibleCount}
            />
          </div>

          {simulation.missingSkills.length > 0 && (
            <div className="mt-6 rounded-xl bg-amber-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <AlertCircle size={16} /> Missing Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {simulation.missingSkills.map((s) => (
                  <span key={s} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">{s}</span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(simulation.ineligibilityBreakdown).length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-ink-800">Why you're not eligible (by rule)</p>
              <div className="space-y-1.5 text-sm text-gray-600">
                {Object.entries(simulation.ineligibilityBreakdown).map(([rule, count]) => (
                  <div key={rule} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="capitalize">{rule === 'cgpa' ? 'CGPA below requirement' : rule === 'branch' ? 'Branch mismatch' : rule === 'year' ? 'Year mismatch' : rule === 'backlogs' ? 'Backlog(s) in current profile' : 'Missing skills'}</span>
                    <span className="font-semibold text-brand-600">{count} drive(s)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-ink-800">{value}</dd>
    </div>
  );
}

function ScenarioRow({ label, gain, newCount }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
      <p className="text-sm text-ink-700">{label}</p>
      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
        <TrendingUp size={16} />
        Eligible for {newCount} companies {gain > 0 && <span className="text-xs text-green-500">(+{gain})</span>}
      </div>
    </div>
  );
}
