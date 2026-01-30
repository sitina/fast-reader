import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {WordDisplay} from '@fast-reader/core';
import {colors, fontSize} from '../theme';

interface RSVPDisplayProps {
  wordDisplay: WordDisplay | null;
  showGuides?: boolean;
}

export function RSVPDisplay({wordDisplay, showGuides = true}: RSVPDisplayProps) {
  if (!wordDisplay) {
    return (
      <View style={styles.container}>
        <View style={styles.wordContainer}>
          <Text style={styles.placeholder}>Ready to read</Text>
        </View>
      </View>
    );
  }

  const {leftPart, orpChar, rightPart} = wordDisplay;

  return (
    <View style={styles.container}>
      {showGuides && (
        <View style={styles.guides}>
          <View style={styles.verticalLine} />
          <View style={styles.horizontalLine} />
        </View>
      )}
      <View style={styles.wordContainer}>
        <View style={styles.wordWrapper}>
          <Text style={styles.leftPart}>{leftPart}</Text>
          <Text style={styles.orpChar}>{orpChar}</Text>
          <Text style={styles.rightPart}>{rightPart}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  guides: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  verticalLine: {
    position: 'absolute',
    top: '25%',
    bottom: '25%',
    left: '50%',
    width: 2,
    backgroundColor: colors.guideLight,
    marginLeft: -1,
  },
  horizontalLine: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: '50%',
    height: 2,
    backgroundColor: colors.border,
    marginTop: -1,
  },
  wordContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
    paddingHorizontal: 20,
  },
  wordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftPart: {
    fontFamily: 'monospace',
    fontSize: fontSize.display,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 2,
  },
  orpChar: {
    fontFamily: 'monospace',
    fontSize: fontSize.display,
    fontWeight: '500',
    color: colors.accent,
    letterSpacing: 2,
  },
  rightPart: {
    fontFamily: 'monospace',
    fontSize: fontSize.display,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 2,
  },
  placeholder: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
});
