import { registerRootComponent } from 'expo'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from './src/theme/m3Theme.js'
import App from './src/App.jsx'

function Root() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <App />
      </PaperProvider>
    </SafeAreaProvider>
  )
}

registerRootComponent(Root)
