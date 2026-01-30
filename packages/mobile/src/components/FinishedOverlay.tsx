import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, fontSize} from '../theme';

interface FinishedOverlayProps {
  totalWords: number;
  wpm: number;
  onReadAgain: () => void;
  onClose: () => void;
}

export function FinishedOverlay({
  totalWords,
  wpm,
  onReadAgain,
  onClose,
}: FinishedOverlayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finished!</Text>
      <Text style={styles.stats}>
        {totalWords} words at ~{wpm} WPM
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onReadAgain}
          activeOpacity={0.7}>
          <Text style={styles.buttonText}>Read Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={onClose}
          activeOpacity={0.7}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.success,
  },
  stats: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
