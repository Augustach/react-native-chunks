import { StyleSheet, View, Text, Platform } from 'react-native'
import { IntlProvider, FormattedMessage, defineMessages } from 'react-intl'
import CodePush, { type LocalPackage } from 'react-native-code-push'
import { Translations, Message, PngImage, CrashCoreButton } from './core'
import { CrashButton } from './CrashButton'
import { ReanimatedButton } from './ReanimatedButton'
import { useEffect, useState } from 'react'

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

const useGetCodePushVersion = () => {
  const [version, setVersion] = useState<LocalPackage | null>(null)
  useEffect(() => {
    CodePush.getUpdateMetadata().then(setVersion)
  }, [])
  return version
}

const useInstallCodePushUpdate = () => {
  useEffect(() => {
    CodePush.sync(
      {
        deploymentKey: Platform.select({
          ios: process.env.CODEPUSH_DEPLOYMENT_KEY_IOS,
          android: process.env.CODEPUSH_DEPLOYMENT_KEY_ANDROID,
        }),
        installMode: CodePush.InstallMode.IMMEDIATE,
      },
      (status) => {
        console.log(`sync status: ${status}`)
      }
    )
  }, [])
}

export default function App() {
  useInstallCodePushUpdate()
  const version = useGetCodePushVersion()

  return (
    <IntlProvider messages={Translations.en} locale="en" defaultLocale="en" textComponent={Text}>
      <View style={styles.container}>
        <Text>CodePush Version: {version?.label ?? 'N/A'}</Text>
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
