import { Button } from 'react-native'

export const CrashButton = () => {
  return (
    <Button
      onPress={() => {
        throw new Error(`CrashButton has crashed! ${new Date().toISOString()}`)
      }}
      title="CrashButton"
    />
  )
}
