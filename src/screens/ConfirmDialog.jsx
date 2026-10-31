import { Button, Dialog, Portal, Text } from 'react-native-paper'
import Page from '../components/Page.jsx'
import { useDialogStyle } from '../theme/m3Theme.js'

export default function ConfirmDialog() {
  const dialogStyle = useDialogStyle()
  return (
    <Page>
      <Text variant="headlineMedium">Photos</Text>

      <Portal>
        <Dialog visible style={dialogStyle}>
          <Dialog.Title>Delete 3 photos?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">They will be removed from all your devices.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text">Cancel</Button>
            <Button mode="text">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Page>
  )
}
