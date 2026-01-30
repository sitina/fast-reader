import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, fontSize} from '../theme';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNavigate: (delta: number) => void;
}

export function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onNavigate,
}: PlaybackControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate(-10)}
        activeOpacity={0.7}>
        <Text style={styles.buttonText}>« 10</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate(-1)}
        activeOpacity={0.7}>
        <Text style={styles.buttonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={onTogglePlay}
        activeOpacity={0.7}>
        <Text style={[styles.buttonText, styles.primaryButtonText]}>
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate(1)}
        activeOpacity={0.7}>
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate(10)}
        activeOpacity={0.7}>
        <Text style={styles.buttonText}>10 »</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.text,
  },
});
