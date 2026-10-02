import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

const THEMES = [
  require('./assets/backgrounds/bg-noir.webp'),
  require('./assets/backgrounds/bg-logo.webp'),
  require('./assets/backgrounds/bg-warm.webp'),
];

export default function ThemeBackground({
  interval = 12000, // time each image stays (ms)
  fade = 1800,      // crossfade duration (ms)
  scrim = 0.45,     // 0 to 1, overlay darkness for text readability
}) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim;
    const timer = setTimeout(() => {
      anim = Animated.timing(opacity, {
        toValue: 1,
        duration: fade,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
      anim.start(({ finished }) => {
        if (!finished) return;
        setCurrent(next);
        setNext((next + 1) % THEMES.length);
        opacity.setValue(0);
      });
    }, interval);

    return () => {
      clearTimeout(timer);
      anim && anim.stop();
    };
  }, [next, interval, fade, opacity]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={THEMES[current]} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <Animated.Image
        source={THEMES[next]}
        style={[StyleSheet.absoluteFill, { opacity }]}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${scrim})` }]} />
    </View>
  );
}
