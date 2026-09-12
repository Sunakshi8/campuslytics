const CLASS_MAP = {
  Applied: 'badge-applied',
  Shortlisted: 'badge-shortlisted',
  Interview: 'badge-interview',
  Rejected: 'badge-rejected',
  Selected: 'badge-selected',
};

export default function StatusBadge({ status }) {
  const cls = CLASS_MAP[status] || 'badge-applied';
  return <span className={`badge ${cls}`}>{status}</span>;
}
