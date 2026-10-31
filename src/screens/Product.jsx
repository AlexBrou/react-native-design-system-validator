import { StyleSheet, View } from 'react-native'
import { Appbar, Button, Card, Chip, FAB, Text, useTheme } from 'react-native-paper'
import Page, { useWindowMargin } from '../components/Page.jsx'

export default function Product() {
  const theme = useTheme()
  const margin = useWindowMargin()
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction accessibilityLabel="Back" onPress={() => {}} />
        <Appbar.Content title="Trail jacket" />
        <Appbar.Action icon="heart-outline" accessibilityLabel="Save" onPress={() => {}} />
      </Appbar.Header>

      <Page belowAppbar>
        <Card mode="outlined">
          <View style={[styles.cover, { backgroundColor: theme.colors.primaryContainer }]} />
          <Card.Content style={styles.content}>
            <Text variant="headlineSmall">Trail jacket</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Lightweight, packable shell for wet mountain days.
            </Text>
            <View style={styles.chips}>
              <Chip mode="outlined">Waterproof</Chip>
              <Chip mode="outlined">2-year warranty</Chip>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button mode="text">Details</Button>
            <Button mode="contained">Add to cart</Button>
          </Card.Actions>
        </Card>
      </Page>

      <FAB icon="cart-plus" accessibilityLabel="Add to cart" style={[styles.fab, { right: margin, bottom: margin }]} onPress={() => {}} />
    </>
  )
}

const styles = StyleSheet.create({
  cover: { height: 200 },
  content: { paddingTop: 16, paddingBottom: 16, gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fab: { position: 'absolute' },
})
