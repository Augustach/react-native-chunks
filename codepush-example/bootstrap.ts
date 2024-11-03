import { Platform } from 'react-native'
import { loadChunk, isChunkBundle } from 'react-native-chunks'

if (isChunkBundle()) {
  const bundleName = Platform.select({
    ios: 'main.jsbundle',
    android: 'index.android.bundle',
  })
  loadChunk({ uri: `assets://${bundleName}` }, `${bundleName}_sm`)
}
