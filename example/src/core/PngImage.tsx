import { Image, StyleSheet } from 'react-native'

export function PngImage() {
  return <Image source={require('./image1.png')} style={style.image} />
}

const style = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
