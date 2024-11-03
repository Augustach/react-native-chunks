import { StyleSheet, View, Text } from 'react-native'
import { Translations, Message, PngImage, CrashCoreButton } from './core'
import { CrashButton } from './CrashButton'
import { IntlProvider, FormattedMessage, defineMessages } from 'react-intl'
import { ReanimatedButton } from './ReanimatedButton'

const messages = defineMessages({
  message: {
    id: 'message',
    defaultMessage: 'Should be replaced by en.json',
  },
  today: {
    id: 'today',
    defaultMessage: 'Today is {ts, date, ::yyyyMMdd}',
  },
})

export default function App() {
  return (
    <IntlProvider messages={Translations.en} locale="en" defaultLocale="en" textComponent={Text}>
      <View style={styles.container}>
        <Text>{Translations.en['message']}</Text>
        <FormattedMessage {...messages.message} />
        <FormattedMessage {...messages.today} values={{ ts: Date.now() }} />
        <Message />
        <PngImage />
        <CrashCoreButton
          onPress={() => {
            throw new Error(`CrashCoreButton has crashed! ${new Date().toISOString()}`)
          }}
        />
        <CrashButton />
        <ReanimatedButton />
      </View>
    </IntlProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
