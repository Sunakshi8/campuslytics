import { useState } from 'react';
import TextInput from '../common/TextInput';
import Button from '../common/Button';

const defaultForm = {
  title: '', jobType: 'Full-Time', location: '', packageMin: 0, packageMax: 0, stipend: 0,
  description: '', rolesResponsibilities: '', batch: '', applyBy: '',
  eligibility: { minCgpa: 0, branches: '', years: '', maxBacklogs: 0, requiredSkills: '' },
  tags: '',
};

export default function DriveForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => {
    if (!initial) return defaultForm;
    return {
      ...initial,
      applyBy: initial.applyBy ? new Date(initial.applyBy).toISOString().slice(0, 10) : '',
      tags: (initial.tags || []).join(', '),
      eligibility: {
        minCgpa: initial.eligibility?.minCgpa || 0,
        branches: (initial.eligibility?.branches || []).join(', '),
        years: (initial.eligibility?.years || []).join(', '),
        maxBacklogs: initial.eligibility?.maxBacklogs || 0,
        requiredSkills: (initial.eligibility?.requiredSkills || []).join(', '),
      },
    };
  });

  const csvToArray = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      packageMin: Number(form.packageMin),
      packageMax: Number(form.packageMax),
      stipend: Number(form.stipend),
      tags: csvToArray(form.tags),
      eligibility: {
        minCgpa: Number(form.eligibility.minCgpa),
        branches: csvToArray(form.eligibility.branches),
        years: csvToArray(form.eligibility.years),
        maxBacklogs: Number(form.eligibility.maxBacklogs),
        requiredSkills: csvToArray(form.eligibility.requiredSkills),
      },
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput label="Role Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="SDE Intern" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">Job Type</span>
          <select
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={form.jobType}
            onChange={(e) => setForm({ ...form, jobType: e.target.value })}
          >
            <option>Internship</option>
            <option>Full-Time</option>
            <option>Internship + PPO</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <TextInput label="Batch" placeholder="2025-2027" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextInput label="Package Min (LPA)" type="number" value={form.packageMin} onChange={(e) => setForm({ ...form, packageMin: e.target.value })} />
        <TextInput label="Package Max (LPA)" type="number" value={form.packageMax} onChange={(e) => setForm({ ...form, packageMax: e.target.value })} />
        <TextInput label="Stipend (₹/mo)" type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
      </div>

      <TextInput label="Application Deadline" type="date" required value={form.applyBy} onChange={(e) => setForm({ ...form, applyBy: e.target.value })} />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-800">Description</span>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-800">Roles &amp; Responsibilities</span>
        <textarea
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          value={form.rolesResponsibilities}
          onChange={(e) => setForm({ ...form, rolesResponsibilities: e.target.value })}
        />
      </label>

      <TextInput label="Tags (comma separated)" placeholder="Good CGPA, React, DSA" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />

      <div className="rounded-xl border border-gray-100 p-4">
        <p className="mb-3 text-sm font-semibold text-ink-800">Eligibility Rules</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput label="Min CGPA" type="number" step="0.1" value={form.eligibility.minCgpa} onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, minCgpa: e.target.value } })} />
          <TextInput label="Max Backlogs" type="number" value={form.eligibility.maxBacklogs} onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, maxBacklogs: e.target.value } })} />
          <TextInput label="Eligible Branches (comma separated, blank = all)" value={form.eligibility.branches} onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, branches: e.target.value } })} />
          <TextInput label="Eligible Years (comma separated, blank = all)" value={form.eligibility.years} onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, years: e.target.value } })} />
        </div>
        <TextInput className="mt-4" label="Required Skills (comma separated)" value={form.eligibility.requiredSkills} onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, requiredSkills: e.target.value } })} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>{initial ? 'Update Drive' : 'Post Drive'}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
