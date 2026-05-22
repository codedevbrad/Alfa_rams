import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const inputClass =
  'w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

export interface LibraryModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function LibraryModal({
  open,
  title,
  description,
  onClose,
  children,
  footer
}: LibraryModalProps): React.JSX.Element | null {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-100">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-700 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export interface AddLibraryNameModalProps {
  open: boolean
  title: string
  description?: string
  label: string
  placeholder?: string
  submitLabel?: string
  onClose: () => void
  onSubmit: (name: string) => Promise<void> | void
}

export function AddLibraryNameModal({
  open,
  title,
  description,
  label,
  placeholder,
  submitLabel = 'Add',
  onClose,
  onSubmit
}: AddLibraryNameModalProps): React.JSX.Element {
  const inputId = useId()
  const formId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setValue('')
    setError(null)
    setSubmitting(false)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Try a different name.')
      setSubmitting(false)
    }
  }

  return (
    <LibraryModal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={submitting || !value.trim()}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={(e) => void handleSubmit(e)}>
        <label htmlFor={inputId} className="mb-1 block text-sm text-slate-400">
          {label}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className={inputClass}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          placeholder={placeholder}
          disabled={submitting}
          autoComplete="off"
        />
        {error && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>
    </LibraryModal>
  )
}

export interface LibraryConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirming?: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

export function LibraryConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  confirming = false,
  onClose,
  onConfirm
}: LibraryConfirmModalProps): React.JSX.Element {
  return (
    <LibraryModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={() => void onConfirm()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {confirming ? 'Deleting…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-300">{message}</p>
    </LibraryModal>
  )
}
