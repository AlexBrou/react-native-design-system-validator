// This screen breaks M3 rules on purpose, to demo the checkers.
import { Text as RNText, TouchableOpacity, View } from 'react-native'
import { Button, FAB, IconButton, Text, TextInput, useTheme } from 'react-native-paper'
import Page from '../components/Page.jsx'

export default function Checkout() {
  const theme = useTheme()
  return (
    <>
      <Page>
        <Text variant="headlineSmall">Checkout</Text>

        <View style={{ marginTop: 16, gap: 6 }}>
          <View style={{ padding: 16, backgroundColor: theme.colors.surfaceContainer }}>
            <Text variant="bodyLarge">Trail jacket × 1</Text>
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="minus" accessibilityLabel="Decrease" style={{ margin: 0 }} />
              <IconButton icon="plus" accessibilityLabel="Increase" style={{ margin: 0 }} />
              <IconButton icon="delete" accessibilityLabel="Remove" style={{ margin: 0 }} />
            </View>
          </View>

          <RNText style={{ fontSize: 20, fontWeight: '700' }}>Total: $189.00</RNText>
          <Text variant="bodySmall" style={{ color: '#d32f2f' }}>
            Only 2 left in stock
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput mode="outlined" label="Coupon" dense />
            <TouchableOpacity>
              <RNText>Apply</RNText>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Button mode="contained" style={{ marginRight: 10 }}>Pay now</Button>
            <Button mode="contained" compact style={{ borderRadius: 4, height: 36 }}>Pay later</Button>
          </View>
        </View>
      </Page>

      <FAB icon="chat" accessibilityLabel="Help" customSize={48} style={{ position: 'absolute', left: 8, bottom: 16 }} />
      <FAB icon="shopping" accessibilityLabel="Bag" style={{ position: 'absolute', right: 16, bottom: 16 }} />
    </>
  )
}
