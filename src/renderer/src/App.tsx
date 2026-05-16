import { RamsLibraryProvider } from '@renderer/library'
import RamsBuilder from './rams'

function App(): React.JSX.Element {
  return (
    <RamsLibraryProvider>
      <RamsBuilder />
    </RamsLibraryProvider>
  )
}

export default App
