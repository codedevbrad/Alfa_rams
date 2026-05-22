import { useState } from 'react'
import { EmailAnalyticsPanel } from './analytics'
import { EmailDashboardPanel } from './EmailDashboardPanel'
import { EmailSendersPanel } from './EmailSendersPanel'

type EmailTab = 'manage' | 'dashboard' | 'analytics'

const TAB_COPY: Record<EmailTab, { description: string }> = {
  manage: {
    description:
      'Optional “Send mail as” aliases for inbox replies (must match Gmail account settings).'
  },
  dashboard: {
    description: 'Gmail inbox for RAMS/pending — view, draft replies with AI, and send via Gmail.'
  },
  analytics: {
    description:
      'Overview of messages in your monitored Gmail label and in-app workflow tracking (opened, fulfilled, replied).'
  }
}

export function EmailScreen(): React.JSX.Element {
  const [tab, setTab] = useState<EmailTab>('manage')
  const copy = TAB_COPY[tab]

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-700 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-100">Email</h1>
        <p className="mt-1 text-sm text-slate-400">{copy.description}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('manage')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === 'manage' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Manage
          </button>
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === 'dashboard' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setTab('analytics')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === 'analytics' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Analytics
          </button>
        </div>
      </header>

      <div
        className={`min-h-0 flex-1 ${tab === 'dashboard' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto overscroll-contain'}`}
      >
        <div
          className={
            tab === 'dashboard' ? 'flex min-h-0 flex-1 flex-col' : 'mx-auto w-full max-w-2xl'
          }
        >
          {tab === 'manage' && <EmailSendersPanel />}
          {tab === 'dashboard' && <EmailDashboardPanel />}
          {tab === 'analytics' && <EmailAnalyticsPanel />}
        </div>
      </div>
    </div>
  )
}
