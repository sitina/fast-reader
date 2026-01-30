import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ProgressInfo} from '@fast-reader/core';
import {colors, spacing, fontSize} from '../theme';

interface ProgressBarProps {
  progress: ProgressInfo;
}

export function ProgressBar({progress}: ProgressBarProps) {
  const {currentIndex, totalWords, percentage} = progress;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, {width: `${percentage}%`}]} />
      </View>
      <Text style={styles.text}>
        {totalWords > 0 ? `${currentIndex + 1} / ${totalWords} words` : '0 / 0 words'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '60%',
    maxWidth: 400,
    marginTop: spacing.xl,
  },
  bar: {
    height: 4,
    backgroundColor: colors.progressBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  text: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textDark,
    marginTop: spacing.sm,
  },
});
