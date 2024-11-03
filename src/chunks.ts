import { NativeModules, Image } from 'react-native'

interface ChunkModule {
  loadChunk: (url: string, name?: string) => void
}

const ChunkModule: ChunkModule = NativeModules.Chunks

type AssetRequireSource = number

type ChunkSource =
  | AssetRequireSource
  | {
      uri: string
    }

declare global {
  var isChunk: boolean
  var METRO_CHUNK_BUNDLE: string
}

export function loadChunk(source: ChunkSource, name?: string): void {
  global.isChunk = true
  let uri
  if (typeof source === 'number') {
    uri = Image.resolveAssetSource(source).uri
  } else {
    uri = source.uri
  }

  ChunkModule.loadChunk(uri, name)
}

export function loadAssets(_fn: () => void) {
  // do nothing
}

export function isChunkBundle() {
  return !!global.METRO_CHUNK_BUNDLE
}
