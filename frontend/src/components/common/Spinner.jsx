export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-700">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
