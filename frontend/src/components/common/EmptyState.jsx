export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/60 py-14 text-center">
      {Icon && <Icon className="h-10 w-10 text-gray-300" strokeWidth={1.5} />}
      <p className="font-semibold text-ink-800">{title}</p>
      {description && <p className="max-w-xs text-sm text-gray-500">{description}</p>}
    </div>
  );
}
