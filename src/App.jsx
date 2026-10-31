import { lazy, Suspense, useEffect, useState } from 'react'
import { BackHandler, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { Appbar, List, useTheme } from 'react-native-paper'
import { screens } from './screens/registry.js'

const components = Object.fromEntries(screens.map((s) => [s.id, lazy(s.load)]))
const web = Platform.OS === 'web'

const hashRoute = () => window.location.hash.replace(/^#\/?/, '')
// exp://host:8081/--/checkout (Expo Go) or <scheme>://checkout -> "checkout"
const linkRoute = (url) => (url ? (url.split('/--/')[1] ?? url.replace(/^[\w.+-]+:\/\/[^/]*\/?/, '')).split(/[?#]/)[0] : '')

// On web the route is the URL hash (/#/<id>), so the rendered checks can open
// each screen directly. On a device it comes from the deep link the app was
// opened with (or a tap in the list); Android back returns to the index.
function useRoute() {
  const [route, setRoute] = useState(() => (web ? hashRoute() : ''))
  useEffect(() => {
    if (web) {
      const onChange = () => setRoute(hashRoute())
      window.addEventListener('hashchange', onChange)
      return () => window.removeEventListener('hashchange', onChange)
    }
    Linking.getInitialURL().then((url) => setRoute(linkRoute(url)))
    const link = Linking.addEventListener('url', ({ url }) => setRoute(linkRoute(url)))
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      setRoute((r) => (r ? '' : r))
      return true
    })
    return () => {
      link.remove()
      back.remove()
    }
  }, [])
  const go = (id) => (web ? (window.location.hash = `#/${id}`) : setRoute(id))
  return [route, go]
}

export default function App() {
  const [route, go] = useRoute()
  const theme = useTheme()
  const Screen = components[route]

  // data-screen marks the screen for the rendered checks; data-primary-color
  // lets them tell filled buttons apart.
  if (Screen) {
    return (
      <Suspense>
        <View dataSet={{ screen: route, primaryColor: theme.colors.primary }} style={[styles.fill, { backgroundColor: theme.colors.surface }]}>
          <Screen />
        </View>
      </Suspense>
    )
  }

  return (
    <View dataSet={{ screen: 'index', primaryColor: theme.colors.primary }} style={[styles.fill, { backgroundColor: theme.colors.surface }]}>
      <Appbar.Header>
        <Appbar.Content title="Screens" />
      </Appbar.Header>
      <ScrollView>
        {screens.map((s) => (
          <List.Item key={s.id} title={s.title} description={`#/${s.id}`} onPress={() => go(s.id)} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
