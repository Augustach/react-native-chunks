import { Text } from 'react-native'
import { Translations } from './translations'

export function Message() {
  return <Text>{Translations.en['message']}</Text>
}
