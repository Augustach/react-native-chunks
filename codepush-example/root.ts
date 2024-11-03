import 'react-native-code-push-diff/setup'
import { AppRegistry } from 'react-native'
import App from './src/App'
import { name as appName } from './app.json'
import { applyStackParser } from 'react-native-chunks'

applyStackParser()

AppRegistry.registerComponent(appName, () => App)

export function app() {
  // Do nothing
}
