import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function ThemeBackground({ scrim = 0.55 }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={require('./assets/backgrounds/bg-noir.webp')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${scrim})` }]} />
    </View>
  );
}
