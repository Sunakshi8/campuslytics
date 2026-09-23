export default function TextInput({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>}
      <input
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
