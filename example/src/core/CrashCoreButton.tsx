import { Button } from 'react-native'

interface CrashCoreButtonProps {
  onPress?: () => void
}

export const CrashCoreButton = ({ onPress }: CrashCoreButtonProps) => {
  return <Button onPress={handlePress} title="CrashCoreButton" />

  function handlePress() {
    onPress?.()
  }
}
