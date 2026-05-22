import type { InboxTab } from '@renderer/systems/email/useInbox'

interface InboxTabsProps {
  activeTab: InboxTab
  unfulfilledCount: number
  fulfilledCount: number
  onTabChange: (tab: InboxTab) => void
}

export function InboxTabs({
  activeTab,
  unfulfilledCount,
  fulfilledCount,
  onTabChange
}: InboxTabsProps): React.JSX.Element {
  const tabs: { id: InboxTab; label: string; count: number }[] = [
    { id: 'unfulfilled', label: 'Unfulfilled', count: unfulfilledCount },
    { id: 'fulfilled', label: 'Fulfilled', count: fulfilledCount }
  ]

  return (
    <div className="flex shrink-0 gap-1 border-b border-slate-700 px-5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-sky-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-xs text-slate-500">({tab.count})</span>
        </button>
      ))}
    </div>
  )
}
