interface FieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, children, className = '' }: FieldProps): React.JSX.Element {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}): React.JSX.Element {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
    />
  )
}

export function TextArea({
  value,
  onChange,
  rows = 4
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}): React.JSX.Element {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
    />
  )
}

export function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
