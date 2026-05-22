import { useState } from 'react'
import { LibraryAdmin } from '@renderer/screens/rams/library'
import { RamsHome } from './RamsHome'

interface HomeScreenProps {
  onNewRams: () => void
  onOpenSettings?: () => void
}

export function HomeScreen({ onNewRams, onOpenSettings }: HomeScreenProps): React.JSX.Element {
  const [view, setView] = useState<'home' | 'library'>('home')

  if (view === 'library') {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-6">
        <LibraryAdmin onBack={() => setView('home')} />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6">
      <RamsHome
        onNewRams={onNewRams}
        onManageLibrary={() => setView('library')}
        onOpenSettings={onOpenSettings}
      />
    </div>
  )
}

export { RamsHome } from './RamsHome'