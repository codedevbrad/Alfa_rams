interface InboxOpenAiBannerProps {
  configured: boolean
  onOpenSettings: () => void
}

export function InboxOpenAiBanner({
  configured,
  onOpenSettings
}: InboxOpenAiBannerProps): React.JSX.Element | null {
  if (configured) return null

  return (
    <div className="mb-4 rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
      OpenAI API key required for AI features.{' '}
      <button
        type="button"
        onClick={onOpenSettings}
        className="font-medium underline hover:text-amber-100"
      >
        Open settings
      </button>
    </div>
  )
}
