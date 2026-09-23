const VARIANTS = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm',
  outline: 'border border-gray-300 text-ink-800 hover:bg-gray-50',
  ghost: 'text-ink-700 hover:bg-gray-100',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}
