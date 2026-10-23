import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function AnimatedScreen({ children, style }) {
  const { preferences } = useAppPreferences();
  const opacity = useRef(new Animated.Value(preferences.reduce_motion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(preferences.reduce_motion ? 0 : 12)).current;

  useEffect(() => {
    if (preferences.reduce_motion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return undefined;
    }

    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, preferences.reduce_motion, translateY]);

  return (
    <Animated.View style={[{ flex: 1, opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
