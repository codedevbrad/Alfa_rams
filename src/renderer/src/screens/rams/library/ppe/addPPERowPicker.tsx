import { useEffect, useMemo, useRef, useState } from 'react'
import type { PpeCategoryGroupDto, PpeItemDto } from '@shared/rams/library'

interface PpePickerOption {
  group: string
  item: PpeItemDto
}

function buildOptions(categories: PpeCategoryGroupDto[]): PpePickerOption[] {
  return categories.flatMap(({ group, items }) => items.map((item) => ({ group, item })))
}

function filterOptions(options: PpePickerOption[], query: string): PpePickerOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter(
    (option) =>
      option.group.toLowerCase().includes(q) ||
      option.item.category.toLowerCase().includes(q) ||
      option.item.requirement.toLowerCase().includes(q)
  )
}

interface AddPpeRowPickerProps {
  categories: PpeCategoryGroupDto[]
  loading: boolean
  onAdd: (item: PpeItemDto) => void
  onClose: () => void
}

export function AddPpeRowPicker({
  categories,
  loading,
  onAdd,
  onClose
}: AddPpeRowPickerProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const allOptions = useMemo(() => buildOptions(categories), [categories])
  const filtered = useMemo(() => filterOptions(allOptions, query), [allOptions, query])

  const grouped = useMemo(() => {
    const map = new Map<string, PpePickerOption[]>()
    for (const option of filtered) {
      const list = map.get(option.group)
      if (list) list.push(option)
      else map.set(option.group, [option])
    }
    return [...map.entries()]
  }, [filtered])

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="absolute left-0 top-full z-20 w-[min(32rem,calc(100vw-2rem))] pt-2"
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Add PPE row from library"
        className="overflow-hidden rounded-lg border border-slate-600/80 bg-slate-900 shadow-xl shadow-black/40 ring-1 ring-white/5"
      >
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 bg-slate-800/60 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-slate-100">Add from library</p>
          <p className="text-xs text-slate-400">Choose PPE category and requirement</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-700/80 hover:text-slate-100"
          aria-label="Close"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>

      <div className="border-b border-slate-700/60 px-3 py-2">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden
          >
            ⌕
          </span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search group, category or requirement…"
            className="w-full rounded-md border border-slate-600 bg-slate-950/80 py-2 pl-8 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
            disabled={loading}
          />
        </div>
      </div>

      <ul
        className="max-h-72 overflow-y-auto overscroll-contain py-1"
        role="listbox"
        aria-label="PPE items"
      >
        {loading ? (
          <li className="px-4 py-8 text-center text-sm text-slate-500">Loading library…</li>
        ) : grouped.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No matching PPE</li>
        ) : (
          grouped.map(([group, options]) => (
            <li key={group}>
              <p className="sticky top-0 z-10 border-y border-slate-700/50 bg-slate-900/95 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur-sm">
                {group}
              </p>
              <ul>
                {options.map((option) => (
                  <li key={option.item.id}>
                    <button
                      type="button"
                      role="option"
                      onClick={() => onAdd(option.item)}
                      className="group flex w-full flex-col gap-0.5 border-l-2 border-transparent px-3 py-2.5 text-left transition hover:border-sky-500 hover:bg-sky-500/10 focus-visible:border-sky-500 focus-visible:bg-sky-500/10 focus-visible:outline-none"
                    >
                      <span className="text-sm font-medium text-slate-100 group-hover:text-sky-100">
                        {option.item.category}
                      </span>
                      <span className="text-xs leading-snug text-slate-400 group-hover:text-slate-300">
                        {option.item.requirement}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))
        )}
      </ul>

      <div className="flex justify-end gap-2 border-t border-slate-700/80 bg-slate-800/40 px-3 py-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-700/80 hover:text-slate-100"
        >
          Cancel
        </button>
      </div>
      </div>
    </div>
  )
}

interface AddPpeRowButtonProps {
  categories: PpeCategoryGroupDto[]
  loading: boolean
  onAdd: (item: PpeItemDto) => void
}

export function AddPpeRowButton({
  categories,
  loading,
  onAdd
}: AddPpeRowButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent): void => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
          open
            ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
            : 'text-sky-400 hover:bg-sky-500/10 hover:text-sky-300'
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="text-base leading-none">+</span>
        Add PPE row
      </button>
      {open && (
        <AddPpeRowPicker
          categories={categories}
          loading={loading}
          onAdd={(item) => {
            onAdd(item)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}