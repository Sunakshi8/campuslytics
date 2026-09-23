import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { tpoApi } from '../../api/endpoints';

export default function TpoStudents() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    tpoApi.students({ search }).then((res) => setStudents(res.data.students)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        // Expected columns: name, email, password, branch, year, cgpa, backlogs, skills, rollNumber
        const res = await tpoApi.bulkImportStudents(rows);
        setImportResult(res.data);
        load();
      } catch (err) {
        setImportResult({ created: 0, skipped: 0, errors: [{ row: '-', reason: err.message }] });
      } finally {
        setImporting(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <DashboardLayout role="tpo" title="Students">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-72"
          />
        </div>
        <div>
          <Button loading={importing} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Bulk Import (CSV/Excel)
          </Button>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {importResult && (
        <div className="card mb-5 p-4 text-sm">
          <p className="font-semibold text-ink-800">
            Import complete: {importResult.created} created, {importResult.skipped} skipped.
          </p>
          {importResult.errors?.length > 0 && (
            <ul className="mt-2 max-h-32 list-disc space-y-1 overflow-y-auto pl-5 text-xs text-gray-500">
              {importResult.errors.map((e, i) => <li key={i}>Row {e.row}: {e.reason}</li>)}
            </ul>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Expected columns: name, email, password, branch, year, cgpa, backlogs, skills, rollNumber
          </p>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">CGPA</th>
                <th className="px-5 py-3">Profile %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-ink-800">{s.user?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{s.user?.email}</td>
                  <td className="px-5 py-3 text-gray-600">{s.branch}</td>
                  <td className="px-5 py-3 text-gray-600">{s.year}</td>
                  <td className="px-5 py-3 text-gray-600">{s.cgpa}</td>
                  <td className="px-5 py-3 text-gray-600">{s.profileCompletion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
