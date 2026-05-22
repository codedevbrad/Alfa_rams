import { NavigationProvider, Sidebar, useAppNavigation } from '@renderer/navigation'
import { RamsLibraryProvider } from '@renderer/screens/rams/library'
import { RamsScreen } from '@renderer/screens/rams'
import { EmailScreen } from '@renderer/screens/email'
import { SettingsScreen } from '@renderer/screens/settings'

function AppContent(): React.JSX.Element {
  const { screen } = useAppNavigation()

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-hidden">
        {screen === 'rams' && (
          <RamsLibraryProvider>
            <RamsScreen />
          </RamsLibraryProvider>
        )}
        {screen === 'email' && <EmailScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </main>
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  )
}

export default App
