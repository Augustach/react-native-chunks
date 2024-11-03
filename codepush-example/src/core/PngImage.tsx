import { Image, StyleSheet, Text, View } from 'react-native'

export function PngImage() {
  const image = Image.resolveAssetSource(require('./image1.png'))
  return (
    <View style={style.container}>
      <Text>{`imageUri: ${JSON.stringify(image)}`}</Text>
      <Image source={require('./image1.png')} style={style.image} />
    </View>
  )
}

const style = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  container: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
  },
})
