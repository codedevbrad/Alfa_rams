interface RamsHomeProps {
  onNewRams: () => void
}

export function RamsHome({ onNewRams }: RamsHomeProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">ALFA RAMS</h1>
        <p className="mt-2 max-w-md text-slate-400">
          Create a Risk Assessment and Method Statement from a template, preview it, and save as
          Word (.docx).
        </p>
      </div>
      <button
        type="button"
        onClick={onNewRams}
        className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
      >
        New RAMS
      </button>
    </div>
  )
}
