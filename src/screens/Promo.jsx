// This screen passes ESLint but breaks M3 rules through styles defined in
// another file, to show what only the rendered checks can catch.
import { Button, Dialog, Portal, Text } from 'react-native-paper'
import Page from '../components/Page.jsx'
import { promo } from './promo.styles.js'

export default function Promo() {
  return (
    <Page>
      <Text variant="headlineMedium">Home</Text>

      <Portal>
        <Dialog visible style={promo.dialog}>
          <Dialog.Title style={promo.headline}>Get 20% off your next order</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Subscribe to our newsletter and we will send you a code.</Text>
          </Dialog.Content>
          <Dialog.Actions style={promo.actions}>
            <Button mode="text">No thanks</Button>
            <Button mode="contained">Subscribe</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Page>
  )
}
