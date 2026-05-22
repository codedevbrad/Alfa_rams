interface SaveBannerProps {
  filePath: string
  onOpen: () => void
  onDismiss: () => void
}

export function SaveBanner({ filePath, onOpen, onDismiss }: SaveBannerProps): React.JSX.Element {
  return (
    <div
      className="flex shrink-0 items-center gap-3 border-b border-emerald-800/50 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100"
      role="status"
    >
      <span className="min-w-0 flex-1 truncate" title={filePath}>
        Saved to {filePath}
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-md bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600"
      >
        Open file
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md px-2 py-1 text-xs text-emerald-300/80 hover:bg-emerald-800/50 hover:text-emerald-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
