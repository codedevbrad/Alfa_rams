import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AppScreen } from './types'

interface NavigationContextValue {
  screen: AppScreen
  navigate: (screen: AppScreen) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

interface NavigationProviderProps {
  children: ReactNode
  initialScreen?: AppScreen
}

export function NavigationProvider({
  children,
  initialScreen = 'rams'
}: NavigationProviderProps): React.JSX.Element {
  const [screen, setScreen] = useState<AppScreen>(initialScreen)

  const navigate = useCallback((next: AppScreen) => {
    setScreen(next)
  }, [])

  const value = useMemo(() => ({ screen, navigate }), [screen, navigate])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useAppNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext)
  if (!ctx) {
    throw new Error('useAppNavigation must be used within NavigationProvider')
  }
  return ctx
}
