import { useState } from 'react'
import type { EmailSenderDto } from '@shared/email/senders'
import { LibraryConfirmModal } from '@renderer/screens/rams/library/LibraryModal'
import { EmailSenderFormModal } from './EmailSenderFormModal'
import { useEmailSenders } from './useEmailSenders'

export function EmailSendersPanel(): React.JSX.Element {
  const { senders, loading, error, upsert, remove } = useEmailSenders()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EmailSenderDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmailSenderDto | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openAdd = (): void => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (sender: EmailSenderDto): void => {
    setEditing(sender)
    setFormOpen(true)
  }

  const closeForm = (): void => {
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await remove(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <p className="text-sm text-slate-400">
          Manage sender identities available when emailing RAMS documents.
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Add sender
        </button>
      </div>

      {loading && (
        <p className="px-5 pb-6 text-sm text-slate-400">Loading senders…</p>
      )}

      {error && !loading && (
        <p className="px-5 pb-6 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && senders.length === 0 && (
        <p className="px-5 pb-6 text-sm text-slate-500">
          No senders yet. Add one to get started.
        </p>
      )}

      {!loading && !error && senders.length > 0 && (
        <ul className="divide-y divide-slate-700/80 border-t border-slate-700/80">
          {senders.map((sender) => (
            <li
              key={sender.id}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-900/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-100">{sender.name}</p>
                <p className="truncate text-sm text-slate-400">{sender.email}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(sender)}
                  className="rounded border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(sender)}
                  className="rounded border border-red-900/60 px-3 py-1 text-sm text-red-400 hover:bg-red-950/40"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EmailSenderFormModal
        open={formOpen}
        sender={editing}
        onClose={closeForm}
        onSubmit={upsert}
      />

      <LibraryConfirmModal
        open={deleteTarget !== null}
        title="Delete sender"
        message={
          deleteTarget
            ? `Remove "${deleteTarget.name}" (${deleteTarget.email})? This cannot be undone.`
            : ''
        }
        confirming={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
