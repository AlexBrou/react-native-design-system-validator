// A row of buttons with the M3 gap between them (design-rules/m3.js).
// Use it whenever two or more buttons sit side by side outside
// Dialog.Actions / Card.Actions.

import { StyleSheet, View } from 'react-native'
import { m3 } from '../../design-rules/m3.js'

export default function ButtonRow({ align = 'end', style, ...rest }) {
  return <View {...rest} style={[styles.row, { justifyContent: align === 'end' ? 'flex-end' : 'flex-start' }, style]} />
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: m3.buttons.gap },
})
