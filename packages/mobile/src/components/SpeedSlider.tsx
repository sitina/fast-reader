import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';
import {colors, spacing, fontSize} from '../theme';

interface SpeedSliderProps {
  wpm: number;
  onWPMChange: (wpm: number) => void;
}

export function SpeedSlider({wpm, onWPMChange}: SpeedSliderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Speed:</Text>
      <Slider
        style={styles.slider}
        minimumValue={100}
        maximumValue={800}
        step={25}
        value={wpm}
        onValueChange={onWPMChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.buttonBackground}
        thumbTintColor={colors.accent}
      />
      <Text style={styles.value}>{wpm} WPM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.accent,
    minWidth: 70,
    textAlign: 'center',
  },
});
