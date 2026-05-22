import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { EmailSenderDto } from '@shared/email/senders'
import { LibraryModal } from '@renderer/screens/rams/library/LibraryModal'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

export interface EmailSenderFormModalProps {
  open: boolean
  sender: EmailSenderDto | null
  onClose: () => void
  onSubmit: (input: { id?: number; name: string; email: string }) => Promise<unknown>
}

export function EmailSenderFormModal({
  open,
  sender,
  onClose,
  onSubmit
}: EmailSenderFormModalProps): React.JSX.Element {
  const formId = useId()
  const nameId = useId()
  const emailId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(sender?.name ?? '')
    setEmail(sender?.email ?? '')
    setError(null)
    setSubmitting(false)
    const t = window.setTimeout(() => nameRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open, sender])

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }
    if (!trimmedEmail) {
      setError('Email is required')
      return
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Enter a valid email address')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        id: sender?.id,
        name: trimmedName,
        email: trimmedEmail
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const title = sender ? 'Edit sender' : 'Add sender'

  return (
    <LibraryModal
      open={open}
      title={title}
      description="Display name and email address used when sending RAMS documents."
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
            disabled={submitting}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : sender ? 'Save' : 'Add'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm text-slate-400">
            Name
          </label>
          <input
            ref={nameRef}
            id={nameId}
            type="text"
            className={inputClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Site Manager"
            disabled={submitting}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor={emailId} className="mb-1 block text-sm text-slate-400">
            Email
          </label>
          <input
            id={emailId}
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            placeholder="name@company.com"
            disabled={submitting}
            autoComplete="off"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>
    </LibraryModal>
  )
}
