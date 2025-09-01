import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';

export function FAB({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.fab, style, aStyle]}> 
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.94))}
        onPressOut={() => (scale.value = withSpring(1))}
        accessibilityRole="button"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={styles.label}>＋</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.light.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: { color: 'white', fontSize: 30, marginTop: -2 },
});
