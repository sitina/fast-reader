import React, {useEffect, useCallback} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {useRSVPEngine} from '../hooks/useRSVPEngine';
import {useSettings} from '../hooks/useSettings';
import {
  RSVPDisplay,
  PlaybackControls,
  SpeedSlider,
  ProgressBar,
  FinishedOverlay,
  GestureContainer,
} from '../components';
import {colors, spacing, fontSize} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

export default function ReaderScreen({navigation, route}: Props) {
  const {text, title} = route.params;
  const {settings} = useSettings();

  const handleFinish = useCallback(() => {
    // Could save progress here
  }, []);

  const {
    isPlaying,
    isFinished,
    currentWord,
    progress,
    wpm,
    loadText,
    togglePlay,
    navigate,
    setWPM,
    reset,
  } = useRSVPEngine({
    initialWPM: settings.wpm,
    smartPauses: settings.smartPauses,
    onFinish: handleFinish,
  });

  // Load text when screen mounts
  useEffect(() => {
    loadText(text);
    // Auto-play after a brief delay
    const timer = setTimeout(() => {
      togglePlay();
    }, 500);
    return () => clearTimeout(timer);
  }, [text, loadText, togglePlay]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReadAgain = useCallback(() => {
    reset();
    setTimeout(() => togglePlay(), 100);
  }, [reset, togglePlay]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title || 'Fast Reader'}
        </Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Main display area with gesture support */}
      <GestureContainer
        onTap={togglePlay}
        onSwipeLeft={() => navigate(1)}
        onSwipeRight={() => navigate(-1)}
        enabled={!isFinished}>
        <View style={styles.display}>
          <RSVPDisplay wordDisplay={currentWord} />
          <ProgressBar progress={progress} />

          {/* Gesture hints */}
          <View style={styles.hints}>
            <Text style={styles.hint}>Tap to play/pause | Swipe to navigate</Text>
          </View>
        </View>
      </GestureContainer>

      {/* Controls footer */}
      <View style={styles.controls}>
        <PlaybackControls
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNavigate={navigate}
        />
        <SpeedSlider wpm={wpm} onWPMChange={setWPM} />
      </View>

      {/* Finished overlay */}
      {isFinished && (
        <FinishedOverlay
          totalWords={progress.totalWords}
          wpm={wpm}
          onReadAgain={handleReadAgain}
          onClose={handleClose}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 28,
    color: colors.textMuted,
    lineHeight: 28,
  },
  display: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hints: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textDark,
  },
  controls: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
});
