// The values here pass the code checks (they are computed, or are not spec
// overrides where they are written) but break M3 once rendered.
import { StyleSheet } from 'react-native'
import { m3 } from '../../design-rules/m3.js'

const wide = m3.dialog.maxWidth + 160

export const promo = StyleSheet.create({
  dialog: { width: wide, maxWidth: wide, alignSelf: 'center' },
  headline: { fontSize: m3.typeScale.headlineSmall.size + 2, lineHeight: m3.typeScale.headlineSmall.lineHeight - 2 },
  actions: { justifyContent: 'flex-start', gap: m3.grid / 2 },
})
