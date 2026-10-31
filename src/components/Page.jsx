// Scrollable screen body: centered, at most 600dp wide, with the M3 window
// margin for the current window size class (design-rules/m3.js).
// It keeps clear of the status bar / notch, unless it sits under an
// Appbar.Header (which does that itself): <Page belowAppbar>.

import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { m3 } from '../../design-rules/m3.js'

// The M3 margin between content and the window edge (16dp compact, 24dp
// medium/expanded). Use it for anything placed against the edge, like a FAB.
export function useWindowMargin() {
  const { width } = useWindowDimensions()
  return m3.windowClasses.find((c) => c.maxWidth === null || width <= c.maxWidth).margin
}

export default function Page({ children, style, belowAppbar = false }) {
  const margin = useWindowMargin()
  const insets = useSafeAreaInsets()
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.body, { paddingHorizontal: margin }, !belowAppbar && { marginTop: insets.top }, style]}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  body: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingVertical: 16 },
})
