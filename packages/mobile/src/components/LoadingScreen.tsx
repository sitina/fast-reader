import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {colors, spacing, fontSize} from '../theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({message = 'Loading...'}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
