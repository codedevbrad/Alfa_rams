interface RamsHomeProps {
  onNewRams: () => void
  onManageLibrary: () => void
}

export function RamsHome({ onNewRams, onManageLibrary }: RamsHomeProps): React.JSX.Element {
  return (
    <div className="flex max-w-lg flex-col items-center gap-6 text-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">ALFA RAMS</h1>
        <p className="mt-2 max-w-md text-slate-400">
          Create a Risk Assessment and Method Statement from a template, preview it, and save as
          Word (.docx).
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onNewRams}
          className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
        >
          New RAMS
        </button>
        <button
          type="button"
          onClick={onManageLibrary}
          className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          Manage library
        </button>
      </div>
    </div>
  )
}
