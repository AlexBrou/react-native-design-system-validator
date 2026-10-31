import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Button, List, Switch, Text, TextInput, useTheme } from 'react-native-paper'
import ButtonRow from '../components/ButtonRow.jsx'
import Page from '../components/Page.jsx'

export default function Settings() {
  const [name, setName] = useState('Alex')
  const theme = useTheme()
  // List.Item sets font sizes but no line heights; give it the M3 roles.
  const item = { style: styles.item, titleStyle: theme.fonts.bodyLarge, descriptionStyle: theme.fonts.bodyMedium }
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction accessibilityLabel="Back" onPress={() => {}} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <Page belowAppbar>
        <Text variant="titleSmall" style={styles.section}>
          Notifications
        </Text>
        <List.Item
          title="Push notifications"
          description="Order updates and offers"
          {...item}
          right={() => <Switch value accessibilityLabel="Push notifications" />}
        />
        <List.Item
          title="Email digest"
          description="A weekly summary"
          {...item}
          right={() => <Switch value={false} accessibilityLabel="Email digest" />}
        />

        <View style={styles.profile}>
          <Text variant="titleSmall" style={styles.section}>
            Profile
          </Text>
          <TextInput mode="outlined" label="Display name" value={name} onChangeText={setName} />
          <ButtonRow>
            <Button mode="outlined">Reset</Button>
            <Button mode="contained">Save</Button>
          </ButtonRow>
        </View>
      </Page>
    </>
  )
}

const styles = StyleSheet.create({
  section: { paddingVertical: 8 },
  item: { paddingLeft: 0, paddingRight: 0 },
  profile: { marginTop: 16, gap: 16 },
})
